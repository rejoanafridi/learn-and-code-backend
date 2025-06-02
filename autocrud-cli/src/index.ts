#!/usr/bin/env node
import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path'; 
import { generateFile, updateServerFile } from './services/fileGenerator'; 
import { toPascalCase } from './utils/textUtils'; 
import { promptForFields, ISchemaField } from './services/interactiveSchemaGenerator'; // Import promptForFields

console.log("autoCRUD CLI");

yargs(hideBin(process.argv))
  .command(
    'generate <type> <resourceName>',
    'Generate new components for a resource (model, controller, routes)',
    (yargsInstance: Argv) => {
      return yargsInstance
        .positional('type', {
          describe: 'Type of component to generate',
          type: 'string',
          choices: ['api'], 
          demandOption: true,
        })
        .positional('resourceName', {
          describe: 'Name of the resource (e.g., product, user). Use PascalCase or camelCase.',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv) => { 
      if (argv.type === 'api') {
        const resourceNameInput = argv.resourceName as string;
        const resourceNamePascal = toPascalCase(resourceNameInput); 
        
        console.log(`Generating API components for resource: ${resourceNamePascal}...`);
        
        // --- Simulate empty fields for non-interactive testing ---
        console.log("Simulating non-interactive mode: Skipping field prompts, using empty schema fields.");
        const schemaFields: ISchemaField[] = []; 
        // const schemaFields: ISchemaField[] = await promptForFields(); // Original call
        
        if (schemaFields.length === 0) {
            console.log("No schema fields were defined (or using simulated empty fields). A default schema (if any in template) or an empty one will be created.");
        }

        const targetProjectSrcPath = path.resolve(__dirname, '../../autoCard/src'); 
        const resourceNameLower = resourceNamePascal.toLowerCase();

        try {
          // 1. Generate Schema
          await generateFile(
            'schema', 
            resourceNamePascal,    
            path.join(targetProjectSrcPath, 'models'), 
            `${resourceNameLower}.model.ts`,
            schemaFields // Pass the (empty) collected fields
          );

          // 2. Generate Controller
          await generateFile(
            'controller',
            resourceNamePascal,
            path.join(targetProjectSrcPath, 'controllers'),
            `${resourceNameLower}.controller.ts`
          );

          // 3. Generate Routes
          await generateFile(
            'routes',
            resourceNamePascal,
            path.join(targetProjectSrcPath, 'routes'),
            `${resourceNameLower}.routes.ts`
          );
          
          // 4. Update server.ts
          await updateServerFile(resourceNamePascal, targetProjectSrcPath);

          console.log(`Successfully generated and integrated API components for ${resourceNamePascal}.`);
        } catch (error) {
          console.error(`Operation failed for resource ${resourceNamePascal}. Error details:`, error);
          // process.exit(1); // Keep this commented for full debug output from all steps
        }

      } else {
        console.error(`Error: Unknown generation type '${argv.type}'. Supported types: 'api'.`);
        process.exit(1); 
      }
    }
  )
  .demandCommand(1, 'You must provide a command. Try "generate api <ResourceName>".')
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()
  .epilogue('For more information, find our documentation at https://example.com (placeholder)')
  .wrap(yargs.terminalWidth())
  .parse();
