import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { toPascalCase, toCamelCase, toPluralLowercase } from '../utils/textUtils';
import { ISchemaField } from './interactiveSchemaGenerator'; // Import the interface

// --- Handlebars Helpers ---
handlebars.registerHelper('mongooseType', function (fieldType: ISchemaField['type'], arrayElementType?: ISchemaField['arrayElementType']) {
  if (fieldType === 'Array' && arrayElementType) {
    // This helper is now less critical as the logic is embedded in processedFields, but can be kept for other uses
    return arrayElementType; // e.g. 'String', 'ObjectId'
  }
  return fieldType; 
});

handlebars.registerHelper('typeScriptType', function (fieldType: ISchemaField['type'], arrayElementType?: ISchemaField['arrayElementType']) {
  let tsType: string;
  switch (fieldType) {
    case 'String': tsType = 'string'; break;
    case 'Number': tsType = 'number'; break;
    case 'Boolean': tsType = 'boolean'; break;
    case 'Date': tsType = 'Date'; break;
    case 'ObjectId': tsType = 'mongoose.Types.ObjectId'; break;
    case 'Array':
      if (arrayElementType) {
        switch (arrayElementType) {
          case 'String': tsType = 'string[]'; break;
          case 'Number': tsType = 'number[]'; break;
          case 'Boolean': tsType = 'boolean[]'; break;
          case 'ObjectId': tsType = 'mongoose.Types.ObjectId[]'; break;
          default: tsType = 'any[]'; 
        }
      } else {
        tsType = 'any[]'; 
      }
      break;
    default: tsType = 'any';
  }
  return tsType;
});

handlebars.registerHelper('stringifyDefaultValue', function (value: any, type: ISchemaField['type']) {
  if (value === undefined || value === null) {
    return 'undefined'; 
  }
  if (type === 'String' || type === 'Date' ) { 
    return `'${String(value).replace(/'/g, "\\'")}'`;
  }
  if (type === 'Boolean' || type === 'Number') {
    return String(value); 
  }
  return `'${String(value).replace(/'/g, "\\'")}'`; 
});

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  // @ts-ignore
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});


// --- File Generation Logic ---
function getTemplatePath(templateName: string): string {
  const isRunningFromDist = __dirname.includes(path.sep + 'dist' + path.sep);
  if (isRunningFromDist) {
    return path.resolve(__dirname, '..', '..', 'src', 'templates', templateName + '.hbs');
  } else {
    return path.resolve(__dirname, '..', 'templates', templateName + '.hbs');
  }
}

export async function generateFile(
  templateName: string,
  resourceName: string, 
  targetBasePath: string,
  outputFileName: string,
  fields?: ISchemaField[] 
): Promise<void> {
  try {
    const templateFilePath = getTemplatePath(templateName);
    
    console.log(`Attempting to read template from: ${templateFilePath}`);
    if (!fs.existsSync(templateFilePath)) {
      // Log error but do not re-throw immediately, let caller decide
      console.error(`Template file not found at ${templateFilePath}. (__dirname: ${__dirname})`);
      throw new Error(`Template file not found: ${templateName}`); // Still throw to signal failure to caller
    }

    const templateContent = await fs.readFile(templateFilePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);

    const processedFields = fields?.map(field => ({
      ...field,
      // For schema.hbs: type: Schema.Types.{{mongooseType}} or type: [Schema.Types.{{arrayElementType}}]
      mongooseType: field.type, // Pass as is, template handles Schema.Types.
      arrayElementType: field.arrayElementType, 
      typeScriptType: handlebars.helpers.typeScriptType(field.type, field.arrayElementType),
      defaultValueStringified: field.defaultValue !== undefined ? handlebars.helpers.stringifyDefaultValue(field.defaultValue, field.type) : undefined,
    }));

    const data = {
      resourceNameLowercase: resourceName.toLowerCase(),
      resourceNamePascalCase: resourceName, 
      resourceNameCamelCase: toCamelCase(resourceName),
      resourceNamePluralLowercase: toPluralLowercase(resourceName.toLowerCase()),
      fields: processedFields || [], 
    };

    const renderedContent = compiledTemplate(data);
    const finalOutputPath = path.join(targetBasePath, outputFileName);

    await fs.ensureDir(targetBasePath);
    await fs.writeFile(finalOutputPath, renderedContent);

    console.log(`Successfully generated file: ${finalOutputPath}`);
  } catch (error) {
    console.error(`Critical error in generateFile for resource ${resourceName} (template: ${templateName}). Halting this generation sequence. Error:`, error);
    throw error; // Re-throw critical errors for the main try-catch in index.ts to handle
  }
}

const IMPORT_PLACEHOLDER = '// AUTOCRUD_PLACEHOLDER_IMPORTS';
const ROUTE_PLACEHOLDER = '// AUTOCRUD_PLACEHOLDER_ROUTES';

export async function updateServerFile(
  resourceName: string, 
  targetProjectSrcPath: string
): Promise<void> {
  const serverFilePath = path.join(targetProjectSrcPath, 'server.ts');
  console.log(`Attempting to update server file: ${serverFilePath}`);

  try {
    if (!fs.existsSync(serverFilePath)) {
      console.warn(`Warning: server.ts not found at ${serverFilePath}. Skipping server file update.`);
      return;
    }

    let content = await fs.readFile(serverFilePath, 'utf-8');

    const resourceNameLower = resourceName.toLowerCase();
    const resourceNameCamel = toCamelCase(resourceName);
    const resourceNamePluralLower = toPluralLowercase(resourceNameLower);
    
    const newImportLine = `import ${resourceNameCamel}Routes from './routes/${resourceNameLower}.routes.js';`;
    const newAppUseLine = `app.use('/api/v1/${resourceNamePluralLower}', ${resourceNameCamel}Routes);`;

    if (content.includes(newImportLine)) {
      console.log(`Import statement for ${resourceName} already exists in server.ts.`);
    } else if (content.includes(IMPORT_PLACEHOLDER)) {
      content = content.replace(IMPORT_PLACEHOLDER, `${newImportLine}\n${IMPORT_PLACEHOLDER}`);
    } else {
      console.warn(`Warning: ${IMPORT_PLACEHOLDER} not found in ${serverFilePath}. Cannot add import automatically.`);
    }

    if (content.includes(newAppUseLine)) {
      console.log(`Route for ${resourceNamePluralLower} already exists in server.ts.`);
    } else if (content.includes(ROUTE_PLACEHOLDER)) {
      content = content.replace(ROUTE_PLACEHOLDER, `${newAppUseLine}\n${ROUTE_PLACEHOLDER}`);
    } else {
      console.warn(`Warning: ${ROUTE_PLACEHOLDER} not found in ${serverFilePath}. Cannot add route automatically.`);
    }

    await fs.writeFile(serverFilePath, content);
    console.log(`Successfully updated server file: ${serverFilePath} for resource ${resourceName}`);

  } catch (error) {
    console.error(`Error updating server file ${serverFilePath} for resource ${resourceName}:`, error);
    // Not re-throwing, as this might be a non-critical part of the generation.
  }
}
