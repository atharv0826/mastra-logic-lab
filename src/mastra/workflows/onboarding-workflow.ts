import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { 
  createStackTool, 
  createContentTypeTool, 
  createGlobalFieldTool 
} from '../tools/contentstack-tools';

/**
 * Contentstack Onboarding Workflow
 * 
 * This workflow orchestrates the complete onboarding process:
 * 1. Gather and validate user requirements
 * 2. Create Contentstack stack
 * 3. Generate content model schemas using AI
 * 4. Create global fields (if needed)
 * 5. Create content types
 * 6. Return summary of what was created
 */

// Define schemas
const triggerSchema = z.object({
    // User inputs
    user_requirements: z.string().describe('Description of what the user wants to build'),
    
    // Stack configuration
    stack_name: z.string().describe('Name for the new stack'),
    stack_description: z.string().describe('Description of the stack'),
    
    // Contentstack credentials
    authtoken: z.string().describe('Contentstack auth token'),
    organization_uid: z.string().describe('Organization UID'),
    
    // Optional
    master_locale: z.string().default('en-us').optional(),
    
    // Generated schemas (from content modeling agent)
    content_model: z.object({
      global_fields: z.array(z.object({
        title: z.string(),
        uid: z.string(),
        description: z.string().optional(),
        schema: z.array(z.any()),
      })).optional(),
      content_types: z.array(z.object({
        title: z.string(),
        uid: z.string(),
        description: z.string().optional(),
        schema: z.array(z.any()),
      })),
    }).describe('Generated content model from AI agent'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  stack: z.object({
    name: z.string(),
    uid: z.string().optional(),
    api_key: z.string().optional(),
  }),
  global_fields: z.array(z.any()),
  content_types: z.array(z.any()),
  statistics: z.object({
    global_fields_created: z.number(),
    content_types_created: z.number(),
    total_items: z.number(),
  }),
});

// Create workflow steps
const validateInputsStep = createStep({
  id: 'validate-inputs',
  description: 'Validate all required inputs are present',
  inputSchema: triggerSchema,
  outputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
  }),
  execute: async ({ inputData }) => {
    const { 
      stack_name, 
      stack_description, 
      authtoken, 
      organization_uid,
      content_model 
    } = inputData || {};

    if (!stack_name || !stack_description) {
      throw new Error('Stack name and description are required');
    }

    if (!authtoken || !organization_uid) {
      throw new Error('Contentstack credentials (authtoken and organization_uid) are required');
    }

    if (!content_model || !content_model.content_types || content_model.content_types.length === 0) {
      throw new Error('At least one content type must be defined in content_model');
    }

    return { 
      validated: true,
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
    };
  },
});

const createStackStep = createStep({
  id: 'create-stack',
  description: 'Create the Contentstack stack',
  inputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    master_locale: z.string().optional(),
  }),
  outputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    const { stack_name, stack_description, authtoken, organization_uid, content_model, validated } = inputData;
    const master_locale = inputData.master_locale || 'en-us';

    const result = await createStackTool.execute({
      context: {
        name: stack_name,
        description: stack_description,
        authtoken,
        organization_uid,
        master_locale,
      },
      runtimeContext: {},
    } as any);

    if (!result.success) {
      throw new Error(`Failed to create stack: ${result.error}`);
    }

    return {
      validated,
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
      stack_uid: result.stack_uid,
      api_key: result.api_key,
    };
  },
});

const createGlobalFieldsStep = createStep({
  id: 'create-global-fields',
  description: 'Create global fields if any are defined',
  inputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
  }),
  outputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
    global_fields_created: z.number(),
    global_fields: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    const { api_key, authtoken, content_model, validated, stack_name, stack_description, organization_uid, stack_uid } = inputData;
    
    if (!api_key) {
      throw new Error('API key is required to create global fields');
    }

    const createdGlobalFields: any[] = [];

    // Only create global fields if they exist in the content model
    if (content_model.global_fields && content_model.global_fields.length > 0) {
      for (const globalField of content_model.global_fields) {
        const result = await createGlobalFieldTool.execute({
          context: {
            api_key: api_key!,
            authtoken,
            global_field: {
              title: globalField.title,
              uid: globalField.uid,
              description: globalField.description || '',
              schema: globalField.schema,
            },
          },
          runtimeContext: {},
        } as any);

        if (result.success) {
          createdGlobalFields.push({
            uid: result.global_field_uid,
            title: result.title,
            status: 'created',
          });
        } else {
          createdGlobalFields.push({
            uid: globalField.uid,
            title: globalField.title,
            status: 'failed',
            error: result.error,
          });
        }
      }
    }

    return {
      validated,
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
      stack_uid,
      api_key,
      global_fields_created: createdGlobalFields.length,
      global_fields: createdGlobalFields,
    };
  },
});

const createContentTypesStep = createStep({
  id: 'create-content-types',
  description: 'Create all content types',
  inputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
    global_fields_created: z.number(),
    global_fields: z.array(z.any()),
  }),
  outputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
    global_fields_created: z.number(),
    global_fields: z.array(z.any()),
    content_types_created: z.number(),
    content_types: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    const { api_key, authtoken, content_model, validated, stack_name, stack_description, organization_uid, stack_uid, global_fields_created, global_fields } = inputData;
    
    if (!api_key) {
      throw new Error('API key is required to create content types');
    }

    const createdContentTypes: any[] = [];

    for (const contentType of content_model.content_types) {
      const result = await createContentTypeTool.execute({
        context: {
          api_key: api_key!,
          authtoken,
          content_type: {
            title: contentType.title,
            uid: contentType.uid,
            description: contentType.description || '',
            schema: contentType.schema,
          },
        },
        runtimeContext: {},
      } as any);

      if (result.success) {
        createdContentTypes.push({
          uid: result.content_type_uid,
          title: result.title,
          status: 'created',
        });
      } else {
        createdContentTypes.push({
          uid: contentType.uid,
          title: contentType.title,
          status: 'failed',
          error: result.error,
        });
      }
    }

    return {
      validated,
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
      stack_uid,
      api_key,
      global_fields_created,
      global_fields,
      content_types_created: createdContentTypes.length,
      content_types: createdContentTypes,
    };
  },
});

const generateSummaryStep = createStep({
  id: 'generate-summary',
  description: 'Generate a summary of what was created',
  inputSchema: z.object({
    validated: z.boolean(),
    stack_name: z.string(),
    stack_description: z.string(),
    authtoken: z.string(),
    organization_uid: z.string(),
    content_model: z.any(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
    global_fields_created: z.number(),
    global_fields: z.array(z.any()),
    content_types_created: z.number(),
    content_types: z.array(z.any()),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData }) => {
    const stackInfo = {
      stack_name: inputData.stack_name,
      stack_uid: inputData.stack_uid,
      api_key: inputData.api_key,
    };
    const globalFieldsInfo = {
      global_fields_created: inputData.global_fields_created,
      global_fields: inputData.global_fields,
    };
    const contentTypesInfo = {
      content_types_created: inputData.content_types_created,
      content_types: inputData.content_types,
    };

    const summary = {
      success: true,
      message: 'Contentstack onboarding completed successfully!',
      stack: {
        name: stackInfo.stack_name,
        uid: stackInfo.stack_uid,
        api_key: stackInfo.api_key,
      },
      global_fields: globalFieldsInfo.global_fields,
      content_types: contentTypesInfo.content_types,
      statistics: {
        global_fields_created: globalFieldsInfo.global_fields_created,
        content_types_created: contentTypesInfo.content_types_created,
        total_items: globalFieldsInfo.global_fields_created + contentTypesInfo.content_types_created,
      },
    };

    return summary;
  },
});

// Create and export the workflow
export const onboardingWorkflow = createWorkflow({
  id: 'contentstack-onboarding-workflow',
  inputSchema: triggerSchema,
  outputSchema: outputSchema,
})
  .then(validateInputsStep)
  .then(createStackStep)
  .then(createGlobalFieldsStep)
  .then(createContentTypesStep)
  .then(generateSummaryStep);

onboardingWorkflow.commit();

