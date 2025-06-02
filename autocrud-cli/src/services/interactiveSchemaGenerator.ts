import inquirer from 'inquirer';

export interface ISchemaField {
  name: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId' | 'Array'; // Mongoose Schema.Types
  required: boolean;
  unique?: boolean;
  defaultValue?: any; 
  ref?: string; // For ObjectId
  arrayElementType?: 'String' | 'Number' | 'Boolean' | 'ObjectId'; // For Array elements
}

const fieldTypeChoices = ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array'];
const arrayElementTypeChoices = ['String', 'Number', 'Boolean', 'ObjectId'];

export async function promptForFields(): Promise<ISchemaField[]> {
  const fields: ISchemaField[] = [];
  let addAnotherField = true;

  console.log('\n--- Define Schema Fields ---');

  try {
    while (addAnotherField) {
      const { confirmAddField } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmAddField',
          message: 'Do you want to add a schema field?',
          default: fields.length === 0, 
        },
      ]);

      if (!confirmAddField) {
        addAnotherField = false;
        continue;
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: "Field name (e.g., 'title', 'email'):",
          validate: (input: string) => {
            if (!input.trim()) return 'Field name cannot be empty.';
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) {
              return 'Invalid field name. Use letters, numbers, underscores. Cannot start with a number.';
            }
            if (fields.find(f => f.name === input.trim())) return 'Field name already exists.';
            return true;
          },
          filter: (input: string) => input.trim(),
        },
        {
          type: 'list',
          name: 'type',
          message: 'Field type:',
          choices: fieldTypeChoices,
        },
        {
          type: 'list',
          name: 'arrayElementType',
          message: 'If type is Array, what is the type of elements in the array?',
          choices: arrayElementTypeChoices,
          when: (currentAnswers) => currentAnswers.type === 'Array',
        },
        {
          type: 'input',
          name: 'ref',
          message: "Reference model name (for ObjectId, e.g., 'User', 'Product'):",
          when: (currentAnswers) => currentAnswers.type === 'ObjectId' || (currentAnswers.type === 'Array' && currentAnswers.arrayElementType === 'ObjectId'),
          filter: (input: string) => input.trim() || undefined,
        },
        {
          type: 'confirm',
          name: 'required',
          message: 'Is this field required?',
          default: false,
        },
        {
          type: 'confirm',
          name: 'unique',
          message: 'Is this field unique?',
          default: false,
          when: (currentAnswers) => currentAnswers.type !== 'Array',
        },
        {
          type: 'input',
          name: 'defaultValue',
          message: "Default value (optional, press Enter to skip):",
          filter: (input: string) => {
              const trimmed = input.trim();
              if (trimmed === 'true') return true;
              if (trimmed === 'false') return false;
              if (trimmed !== '' && !isNaN(Number(trimmed))) return Number(trimmed);
              return trimmed || undefined; 
          }
        },
      ]);
      
      const fieldDefinition: ISchemaField = {
        name: answers.name,
        type: answers.type,
        required: answers.required,
      };

      if (answers.unique !== undefined) fieldDefinition.unique = answers.unique;
      if (answers.defaultValue !== undefined) fieldDefinition.defaultValue = answers.defaultValue;
      if (answers.ref) fieldDefinition.ref = answers.ref;
      if (answers.arrayElementType) fieldDefinition.arrayElementType = answers.arrayElementType;
      
      fields.push(fieldDefinition);
      console.log(`Field '${answers.name}' added.`);
    }
  } catch (error: any) {
    // Check if it's an Inquirer specific error related to non-interactive environment
    if (error.isTtyError || error.message.includes('User force closed the prompt') || error.message.includes('TTY')) {
      console.warn('\nInteractive prompt was closed or is not supported in this environment. Proceeding with no custom fields.');
    } else {
      // For other unexpected errors, log it but still proceed with no fields for CLI robustness in this context
      console.error('An unexpected error occurred during field prompting, proceeding with no custom fields:', error);
    }
    return []; // Return empty fields array to allow generation of default files
  }

  if (fields.length === 0) {
    console.log("No custom fields were defined by the user (either skipped or due to prompt issue).");
  }
  return fields;
}
