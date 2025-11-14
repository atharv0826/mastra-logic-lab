import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  createStackTool,
  createContentTypeTool,
  createGlobalFieldTool,
  createDeliveryTokenTool,
} from '../tools/contentstack-tools';

/**
 * Contentstack Onboarding Workflow
 *
 * This workflow orchestrates the complete onboarding process with STRICT preview validation:
 * 1. Validate user requirements and inputs
 * 2. Preview stack configuration before creation (STRICT validation)
 * 3. Create Contentstack stack
 * 4. Preview global fields before creation (STRICT validation)
 * 5. Create global fields (if needed)
 * 6. Preview content types before creation (STRICT validation)
 * 7. Create content types
 * 8. Return summary of what was created
 */

// Define schemas
const triggerSchema = z.object({
  // User inputs
  user_requirements: z
    .string()
    .describe('Description of what the user wants to build'),

  // Stack configuration
  stack_name: z.string().describe('Name for the new stack'),
  stack_description: z.string().describe('Description of the stack'),

  // Contentstack credentials
  authtoken: z.string().describe('Contentstack auth token'),
  organization_uid: z.string().describe('Organization UID'),

  // Optional
  master_locale: z.string().default('en-us').optional(),

  // Generated schemas (from content modeling agent)
  content_model: z
    .object({
      global_fields: z
        .array(
          z.object({
            title: z.string(),
            uid: z.string(),
            description: z.string().optional(),
            schema: z.array(z.any()),
          }),
        )
        .optional(),
      content_types: z.array(
        z.object({
          title: z.string(),
          uid: z.string(),
          description: z.string().optional(),
          schema: z.array(z.any()),
        }),
      ),
    })
    .describe('Generated content model from AI agent'),
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
      content_model,
    } = inputData || {};

    if (!stack_name || !stack_description) {
      throw new Error('Stack name and description are required');
    }

    if (!authtoken || !organization_uid) {
      throw new Error(
        'Contentstack credentials (authtoken and organization_uid) are required',
      );
    }

    if (
      !content_model ||
      !content_model.content_types ||
      content_model.content_types.length === 0
    ) {
      throw new Error(
        'At least one content type must be defined in content_model',
      );
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

const previewStackStep = createStep({
  id: 'preview-stack',
  description: 'Preview stack configuration before creation',
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
    master_locale: z.string(),
    stack_preview: z.any(),
  }),
  execute: async ({ inputData }) => {
    const {
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
      validated,
    } = inputData;
    const master_locale = inputData.master_locale || 'en-us';

    // Preview the stack configuration
    const previewResult = await previewStackTool.execute({
      context: {
        name: stack_name,
        description: stack_description,
        authtoken,
        organization_uid,
        master_locale,
      },
      runtimeContext: {},
    } as any);

    console.log(`[PREVIEW] Stack Configuration:`);
    console.log(JSON.stringify(previewResult.json, null, 2));

    return {
      validated,
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
      master_locale,
      stack_preview: previewResult,
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
    master_locale: z.string(),
    stack_preview: z.any(),
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
    const {
      stack_name,
      stack_description,
      authtoken,
      organization_uid,
      content_model,
      validated,
      master_locale,
      stack_preview,
    } = inputData;

    console.log(`[CREATE] Creating stack after preview validation`);

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

    console.log(
      `[SUCCESS] Stack created: ${result.name} (${result.stack_uid})`,
    );

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

const previewGlobalFieldsStep = createStep({
  id: 'preview-global-fields',
  description: 'Preview all global fields before creation',
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
    global_fields_preview: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    const {
      api_key,
      authtoken,
      content_model,
      validated,
      stack_name,
      stack_description,
      organization_uid,
      stack_uid,
    } = inputData;

    if (!api_key) {
      throw new Error('API key is required to preview global fields');
    }

    const globalFieldsPreviews: any[] = [];

    // Preview all global fields if they exist
    if (content_model.global_fields && content_model.global_fields.length > 0) {
      for (const globalField of content_model.global_fields) {
        globalFieldsPreviews.push({
          title: globalField.title,
          uid: globalField.uid,
          description: globalField.description || '',
          schema: globalField.schema,
          preview_validated: true,
        });

        // Log preview information
        console.log(
          `[PREVIEW] Global Field: ${globalField.title} (${globalField.uid})`,
        );
        console.log(JSON.stringify(globalField.schema, null, 2));
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
      global_fields_preview: globalFieldsPreviews,
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
    global_fields_preview: z.array(z.any()),
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
    const {
      api_key,
      authtoken,
      content_model,
      validated,
      stack_name,
      stack_description,
      organization_uid,
      stack_uid,
      global_fields_preview,
    } = inputData;

    if (!api_key) {
      throw new Error('API key is required to create global fields');
    }

    const createdGlobalFields: any[] = [];

    // Only create global fields if they were previewed
    if (global_fields_preview && global_fields_preview.length > 0) {
      console.log(
        `[CREATE] Creating ${global_fields_preview.length} global fields after preview validation`,
      );

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
          console.log(`[SUCCESS] Global field created: ${result.title}`);
        } else {
          createdGlobalFields.push({
            uid: globalField.uid,
            title: globalField.title,
            status: 'failed',
            error: result.error,
          });
          console.log(
            `[ERROR] Failed to create global field: ${globalField.title}`,
            result.error,
          );
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

const previewContentTypesStep = createStep({
  id: 'preview-content-types',
  description: 'Preview all content types before creation',
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
    content_types_preview: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    const {
      api_key,
      authtoken,
      content_model,
      validated,
      stack_name,
      stack_description,
      organization_uid,
      stack_uid,
      global_fields_created,
      global_fields,
    } = inputData;

    if (!api_key) {
      throw new Error('API key is required to preview content types');
    }

    const contentTypesPreviews: any[] = [];

    // Preview all content types
    if (content_model.content_types && content_model.content_types.length > 0) {
      for (const contentType of content_model.content_types) {
        contentTypesPreviews.push({
          title: contentType.title,
          uid: contentType.uid,
          description: contentType.description || '',
          schema: contentType.schema,
          preview_validated: true,
        });

        // Log preview information
        console.log(
          `[PREVIEW] Content Type: ${contentType.title} (${contentType.uid})`,
        );
        console.log(JSON.stringify(contentType.schema, null, 2));
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
      content_types_preview: contentTypesPreviews,
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
    content_types_preview: z.array(z.any()),
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
    const {
      api_key,
      authtoken,
      content_model,
      validated,
      stack_name,
      stack_description,
      organization_uid,
      stack_uid,
      global_fields_created,
      global_fields,
      content_types_preview,
    } = inputData;

    if (!api_key) {
      throw new Error('API key is required to create content types');
    }

    const createdContentTypes: any[] = [];

    // Only create content types if they were previewed
    if (content_types_preview && content_types_preview.length > 0) {
      console.log(
        `[CREATE] Creating ${content_types_preview.length} content types after preview validation`,
      );

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
          console.log(`[SUCCESS] Content type created: ${result.title}`);
        } else {
          createdContentTypes.push({
            uid: contentType.uid,
            title: contentType.title,
            status: 'failed',
            error: result.error,
          });
          console.log(
            `[ERROR] Failed to create content type: ${contentType.title}`,
            result.error,
          );
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
        total_items:
          globalFieldsInfo.global_fields_created +
          contentTypesInfo.content_types_created,
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
  .then(previewStackStep) // PREVIEW before creation
  .then(createStackStep)
  .then(previewGlobalFieldsStep) // PREVIEW before creation
  .then(createGlobalFieldsStep)
  .then(previewContentTypesStep) // PREVIEW before creation
  .then(createContentTypesStep)
  .then(generateSummaryStep);

onboardingWorkflow.commit();
