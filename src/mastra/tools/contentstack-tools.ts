import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// ======================
// STACK PREVIEW TOOL
// ======================

export const createPreviewTokenTool = createTool({
  id: 'create-contentstack-preview-token',
  description:
    'Creates a preview token for accessing unpublished content via the Preview API.',
  inputSchema: z.object({
    api_key: z.string(),
    authtoken: z.string(),
    name: z.string().default('Preview Token'),
    description: z.string().default('Preview access for staging environment'),
    environments: z.array(z.string()).default(['staging']),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    preview_token: z.string().optional(),
    token_uid: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const res = await fetch(
        'https://api.contentstack.io/v3/stacks/preview_tokens',
        {
          method: 'POST',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: {
              name: context.name,
              description: context.description,
              environments: context.environments,
            },
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error_message || 'Failed to create preview token');
      return {
        success: true,
        preview_token: data.token.token,
        token_uid: data.token.uid,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
});

// ======================
// STACK CREATION TOOL
// ======================

export const previewStackTool = createTool({
  id: 'preview-contentstack-stack',
  description: 'Shows a preview of the JSON payload that will be sent to Contentstack API for stack creation',
  inputSchema: z.object({
    name: z.string().describe('Name of the stack'),
    description: z.string().describe('Description of the stack'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    organization_uid: z
      .string()
      .default(process.env.CONTENTSTACK_ORG_ID || '')
      .describe('Organization UID (from CONTENTSTACK_ORG_ID env var)'),
    master_locale: z.string().default('en-us').describe('Master locale (default: en-us)')
  }),
  outputSchema: z.object({
    type: z.literal('stack-json'),
    json: z.object({
      stack: z.object({
        name: z.string(),
        description: z.string(),
        master_locale: z.string()
      })
    }),
    headers: z.object({
      authtoken: z.string(),
      organization_uid: z.string(),
      'Content-Type': z.string()
    }),
    endpoint: z.string()
  }),
  execute: async ({ context }) => {
    return {
      type: 'stack-json' as const,
      json: {
        stack: {
          name: context.name,
          description: context.description,
          master_locale: context.master_locale
        }
      },
      headers: {
        authtoken: context.authtoken,
        organization_uid: context.organization_uid,
        'Content-Type': 'application/json'
      },
      endpoint: 'https://api.contentstack.io/v3/stacks'
    };
  }
});


export const createStackTool = createTool({
  id: 'create-contentstack-stack',
  description:
    'Creates a new Contentstack stack with the provided name and description',
  inputSchema: z.object({
    name: z.string().describe('Name of the stack'),
    description: z.string().describe('Description of the stack'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    organization_uid: z
      .string()
      .default(process.env.CONTENTSTACK_ORG_ID || '')
      .describe('Organization UID (from CONTENTSTACK_ORG_ID env var)'),
    master_locale: z
      .string()
      .default('en-us')
      .describe('Master locale (default: en-us)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
    name: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch('https://api.contentstack.io/v3/stacks', {
        method: 'POST',
        headers: {
          authtoken: context.authtoken,
          organization_uid: context.organization_uid,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stack: {
            name: context.name,
            description: context.description,
            master_locale: context.master_locale,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to create stack',
          response: data,
        };
      }

      return {
        success: true,
        stack_uid: data.stack.uid,
        api_key: data.stack.api_key,
        name: data.stack.name,
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// ENVIRONMENT CREATION TOOL
// ======================

export const createEnvironmentTool = createTool({
  id: 'create-contentstack-environment',
  description:
    'Creates an environment in a Contentstack stack with the specified name and URLs',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from the created stack)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    name: z
      .string()
      .describe(
        'Name of the environment (e.g., development, staging, production)',
      ),
    urls: z
      .array(
        z.object({
          locale: z.string().describe('Locale code (e.g., en-us)'),
          url: z.string().describe('URL for this locale'),
        }),
      )
      .default([{ locale: 'en-us', url: 'http://example.com/' }])
      .describe('Array of locale-URL mappings'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    environment_uid: z.string().optional(),
    name: z.string().optional(),
    notice: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(
        'https://api.contentstack.io/v3/environments',
        {
          method: 'POST',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            environment: {
              name: context.name,
              urls: context.urls,
              preview_urls: [
                {
                  locale: 'en-us',
                  preview_url: 'http://localhost:3000/preview',
                },
              ],
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message || data.errors || 'Failed to create environment',
          response: data,
        };
      }

      return {
        success: true,
        environment_uid: data.environment.uid,
        name: data.environment.name,
        notice: data.notice,
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// DELIVERY TOKEN CREATION TOOL
// ======================

export const createDeliveryTokenTool = createTool({
  id: 'create-contentstack-delivery-token',
  description:
    'Creates a delivery token for accessing published content in Contentstack. Context-aware: automatically uses api_key from stack creation, environments from environment creation, and branches from context.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from stack creation or env)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    name: z
      .string()
      .default('Delivery Token')
      .describe('Name of the delivery token'),
    description: z
      .string()
      .default('Token for accessing published content')
      .describe('Description of the delivery token'),
    environments: z
      .array(z.string())
      .default(['development'])
      .describe('Environment names (e.g., ["development", "production"])'),
    branches: z
      .array(z.string())
      .default(['main'])
      .describe('Branch names (e.g., ["main", "staging"])'),
    region: z
      .enum(['us', 'eu', 'azure-na', 'azure-eu', 'gcp-na'])
      .default('us')
      .describe('Contentstack region'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    token_uid: z.string().optional(),
    delivery_token: z
      .string()
      .optional()
      .describe('The actual delivery token string to use for API calls'),
    name: z.string().optional(),
    notice: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const regionUrls: Record<string, string> = {
        us: 'https://app.contentstack.com',
        eu: 'https://eu-app.contentstack.com',
        'azure-na': 'https://azure-na-app.contentstack.com',
        'azure-eu': 'https://azure-eu-app.contentstack.com',
        'gcp-na': 'https://gcp-na-app.contentstack.com',
      };

      const baseUrl = regionUrls[context.region] || regionUrls.us;

      const response = await fetch(`${baseUrl}/api/v3/stacks/delivery_tokens`, {
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
          api_key: context.api_key,
          authtoken: context.authtoken,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token: {
            name: context.name,
            description: context.description,
            scope: [
              {
                module: 'environment',
                environments: context.environments,
                acl: {
                  read: true,
                },
              },
              {
                module: 'branch',
                acl: {
                  read: true,
                },
                branches: ['main'],
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message ||
            data.errors ||
            'Failed to create delivery token',
          response: data,
        };
      }

      return {
        success: true,
        token_uid: data.token.uid,
        delivery_token: data.token.token,
        name: data.token.name,
        notice: data.notice,
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// FETCH DELIVERY TOKEN TOOL
// ======================

export const fetchDeliveryTokenTool = createTool({
  id: 'fetch-contentstack-delivery-token',
  description:
    'Fetches an existing delivery token from Contentstack to view its details, scope, and token value.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Auth token'),
    token_uid: z.string().describe('UID of the delivery token to fetch'),
    region: z
      .enum(['us', 'eu', 'azure-na', 'azure-eu', 'gcp-na'])
      .default('us')
      .describe('Contentstack region'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    token_uid: z.string().optional(),
    delivery_token: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    environments: z.array(z.string()).optional(),
    branches: z.array(z.string()).optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const regionUrls: Record<string, string> = {
        us: 'https://app.contentstack.com',
        eu: 'https://eu-app.contentstack.com',
        'azure-na': 'https://azure-na-app.contentstack.com',
        'azure-eu': 'https://azure-eu-app.contentstack.com',
        'gcp-na': 'https://gcp-na-app.contentstack.com',
      };

      const baseUrl = regionUrls[context.region] || regionUrls.us;

      const response = await fetch(
        `${baseUrl}/api/v3/stacks/delivery_tokens/${context.token_uid}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            api_key: context.api_key,
            authtoken: context.authtoken,
            'content-type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message ||
            data.errors ||
            'Failed to fetch delivery token',
          response: data,
        };
      }

      const token = data.token;
      const envScope = token.scope?.find(
        (s: any) => s.module === 'environment',
      );
      const branchScope = token.scope?.find((s: any) => s.module === 'branch');

      return {
        success: true,
        token_uid: token.uid,
        delivery_token: token.token,
        name: token.name,
        description: token.description,
        environments: envScope?.environments || [],
        branches: branchScope?.branches || [],
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// GLOBAL FIELD CREATION TOOL
// ======================

export const createGlobalFieldTool = createTool({
  id: 'create-contentstack-global-field',
  description:
    'Creates a reusable global field in Contentstack that can be referenced in multiple content types',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    global_field: z.object({
      title: z.string().describe('Title of the global field'),
      uid: z.string().describe('Unique identifier for the global field'),
      description: z
        .string()
        .optional()
        .describe('Description of the global field'),
      schema: z.array(z.any()).describe('Array of field definitions'),
    }),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    global_field_uid: z.string().optional(),
    title: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(
        'https://api.contentstack.io/v3/global_fields',
        {
          method: 'POST',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            global_field: context.global_field,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message ||
            data.errors ||
            'Failed to create global field',
          response: data,
        };
      }

      return {
        success: true,
        global_field_uid: data.global_field.uid,
        title: data.global_field.title,
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// CONTENT TYPE CREATION TOOL
// ======================

export const createContentTypeTool = createTool({
  id: 'create-contentstack-content-type',
  description:
    'Creates a content type (content model) in Contentstack with the specified schema',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    content_type: z.object({
      title: z.string().describe('Title of the content type'),
      uid: z.string().describe('Unique identifier for the content type'),
      description: z
        .string()
        .optional()
        .describe('Description of the content type'),
      schema: z
        .array(z.any())
        .describe('Array of field definitions including title and url fields'),
    }),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content_type_uid: z.string().optional(),
    title: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(
        'https://api.contentstack.io/v3/content_types',
        {
          method: 'POST',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content_type: context.content_type,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message ||
            data.errors ||
            'Failed to create content type',
          response: data,
        };
      }

      return {
        success: true,
        content_type_uid: data.content_type.uid,
        title: data.content_type.title,
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// CONTENT MODEL PREVIEW TOOL
// ======================

export const previewContentModelTool = createTool({
  id: 'preview-contentstack-content-model',
  description:
    'Uses Contentstack AI to generate and preview content types and global fields based on requirements',
  inputSchema: z.object({
    instruction: z
      .string()
      .describe(
        'Structured instruction describing the content model requirements',
      ),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
  }),
  outputSchema: z.object({
    type: z.literal('content-model-json'),
    json: z.object({
      global_fields: z.array(z.any()),
      content_types: z.array(z.any()),
    }),
  }),
  execute: async ({ context }) => {
    try {
      // Create form data with the instruction
      const formData = new FormData();
      formData.append('instruction', context.instruction);

      const response = await fetch(
        'https://ai.contentstack.com/ask-ai/content-model',
        {
          method: 'POST',
          headers: {
            authtoken: context.authtoken,
            accept: '*/*',
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();

      return {
        type: 'content-model-json' as const,
        json: {
          global_fields: data.global_fields || [],
          content_types: data.content_types || [],
        },
      };
    } catch (error) {
      // Return empty arrays on error so the structure is maintained
      console.error('Error generating content model:', error);
      return {
        type: 'content-model-json' as const,
        json: {
          global_fields: [],
          content_types: [],
        },
      };
    }
  },
});

// ======================
// CONVERSATION TOOL - For gathering requirements
// ======================

export const gatherRequirementsTool = createTool({
  id: 'gather-user-requirements',
  description:
    'Gathers and structures user requirements for their digital experience',
  inputSchema: z.object({
    user_input: z
      .string()
      .describe('User description of what they want to build'),
    conversation_history: z
      .array(z.string())
      .optional()
      .describe('Previous conversation messages'),
  }),
  outputSchema: z.object({
    project_type: z
      .string()
      .optional()
      .describe('Type of project (website, blog, e-commerce, etc)'),
    features: z
      .array(z.string())
      .optional()
      .describe('List of features user wants'),
    needs_clarification: z
      .boolean()
      .describe('Whether more information is needed'),
    clarification_questions: z
      .array(z.string())
      .optional()
      .describe('Questions to ask the user'),
    is_ready: z.boolean().describe('Whether we have enough info to proceed'),
    summary: z.string().describe('Summary of what will be built'),
  }),
  execute: async ({ context }) => {
    // This tool structures the conversation but the actual analysis
    // should be done by the agent's reasoning
    return {
      needs_clarification: false,
      is_ready: true,
      summary: context.user_input,
    };
  },
});

// ======================
// GET CONTENT TYPE SCHEMA TOOL
// ======================

export const getContentTypeSchema = createTool({
  id: 'get-content-type-schema',
  description:
    'Fetches the schema of a content type to understand its structure, including global fields. Use this before creating entries to know what fields are required.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    content_type_uid: z.string().describe('UID of the content type to fetch'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content_type: z
      .object({
        title: z.string(),
        uid: z.string(),
        description: z.string().optional(),
        schema: z.array(z.any()),
      })
      .optional(),
    field_summary: z
      .object({
        required_fields: z.array(z.string()),
        optional_fields: z.array(z.string()),
        global_fields: z.array(
          z.object({
            uid: z.string(),
            reference_to: z.string(),
            display_name: z.string(),
            mandatory: z.boolean(),
          }),
        ),
      })
      .optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(
        `https://api.contentstack.io/v3/content_types/${context.content_type_uid}`,
        {
          method: 'GET',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message ||
            data.errors ||
            'Failed to fetch content type schema',
        };
      }

      const schema = data.content_type.schema;
      const required_fields: string[] = [];
      const optional_fields: string[] = [];
      const global_fields: any[] = [];

      // Analyze schema to categorize fields
      schema.forEach((field: any) => {
        if (field.data_type === 'global_field') {
          global_fields.push({
            uid: field.uid,
            reference_to: field.reference_to,
            display_name: field.display_name,
            mandatory: field.mandatory || false,
          });
          if (field.mandatory) {
            required_fields.push(field.uid);
          } else {
            optional_fields.push(field.uid);
          }
        } else {
          if (field.mandatory) {
            required_fields.push(field.uid);
          } else {
            optional_fields.push(field.uid);
          }
        }
      });

      return {
        success: true,
        content_type: {
          title: data.content_type.title,
          uid: data.content_type.uid,
          description: data.content_type.description,
          schema: schema,
        },
        field_summary: {
          required_fields,
          optional_fields,
          global_fields,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// CREATE ENTRY TOOL
// ======================

export const createEntryTool = createTool({
  id: 'create-contentstack-entry',
  description:
    'Creates an entry (content instance) for a specific content type. IMPORTANT: You MUST provide entry_data with all required fields. Use getContentTypeSchema first to know what fields are required.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    content_type_uid: z
      .string()
      .describe('UID of the content type for this entry'),
    locale: z
      .string()
      .default('en-us')
      .describe('Locale for the entry (default: en-us)'),
    entry_data: z
      .record(z.string(), z.any())
      .describe(
        'REQUIRED: Entry data as key-value pairs (e.g., {"title": "My Entry", "url": "/my-entry", "description": "...""}). Must include all required fields from the content type schema. Use getContentTypeSchema to see required fields first.',
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    entry_uid: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional(),
    notice: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(
        `https://api.contentstack.io/v3/content_types/${context.content_type_uid}/entries?locale=${context.locale}`,
        {
          method: 'POST',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entry: context.entry_data,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error_message ||
            JSON.stringify(data.errors) ||
            'Failed to create entry',
          response: data,
        };
      }

      return {
        success: true,
        entry_uid: data.entry.uid,
        title: data.entry.title,
        url: data.entry.url,
        notice: data.notice,
        response: data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// ======================
// GET ENTRY AND GENERATE UI TOOL
// ======================

export const getEntryAndGenerateUITool = createTool({
  id: 'get-entry-and-generate-ui',
  description:
    'Fetches a Contentstack entry and analyzes its structure to provide UI generation recommendations. Returns entry data, field analysis, and suggestions for creating stunning UI components.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe(
        'Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)',
      ),
    content_type_uid: z.string().describe('UID of the content type'),
    entry_uid: z
      .string()
      .optional()
      .describe(
        'UID of specific entry to fetch (if not provided, fetches all entries)',
      ),
    locale: z
      .string()
      .default('en-us')
      .describe('Locale for the entry (default: en-us)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    entry_data: z
      .any()
      .optional()
      .describe('The actual entry data from Contentstack'),
    entries: z
      .array(z.any())
      .optional()
      .describe('Multiple entries if no entry_uid provided'),
    schema_analysis: z
      .object({
        content_type: z.string(),
        fields: z.array(
          z.object({
            uid: z.string(),
            data_type: z.string(),
            display_name: z.string(),
            mandatory: z.boolean(),
            ui_component_suggestion: z.string(),
          }),
        ),
      })
      .optional(),
    ui_recommendations: z
      .object({
        layout_type: z
          .string()
          .describe(
            'Suggested layout type: single-column, two-column, card-grid, etc.',
          ),
        hero_section: z.boolean().describe('Whether to create a hero section'),
        sections: z.array(z.string()).describe('Suggested page sections'),
        components: z
          .array(z.string())
          .describe('Recommended React components'),
      })
      .optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      let endpoint: string;

      if (context.entry_uid) {
        // Fetch specific entry
        endpoint = `https://api.contentstack.io/v3/content_types/${context.content_type_uid}/entries/${context.entry_uid}?locale=${context.locale}`;
      } else {
        // Fetch all entries
        endpoint = `https://api.contentstack.io/v3/content_types/${context.content_type_uid}/entries?locale=${context.locale}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          api_key: context.api_key,
          authtoken: context.authtoken,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to fetch entry',
        };
      }

      // Get content type schema for analysis
      const schemaResponse = await fetch(
        `https://api.contentstack.io/v3/content_types/${context.content_type_uid}`,
        {
          method: 'GET',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
        },
      );

      const schemaData = await schemaResponse.json();

      // Analyze schema and provide UI recommendations
      const fields = schemaData.content_type?.schema || [];
      const fieldAnalysis = fields.map((field: any) => ({
        uid: field.uid,
        data_type: field.data_type,
        display_name: field.display_name,
        mandatory: field.mandatory || false,
        ui_component_suggestion: getUIComponentSuggestion(field),
      }));

      const uiRecommendations = generateUIRecommendations(
        fields,
        context.entry_uid ? data.entry : data.entries[0],
      );

      return {
        success: true,
        entry_data: context.entry_uid ? data.entry : undefined,
        entries: context.entry_uid ? undefined : data.entries,
        schema_analysis: {
          content_type: context.content_type_uid,
          fields: fieldAnalysis,
        },
        ui_recommendations: uiRecommendations,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

// Helper function to suggest UI components based on field type
function getUIComponentSuggestion(field: any): string {
  const { data_type, uid, display_name } = field;

  switch (data_type) {
    case 'text':
      if (uid === 'title' || display_name.toLowerCase().includes('title')) {
        return 'Hero Heading (h1) with large typography and styling';
      }
      if (
        display_name.toLowerCase().includes('subtitle') ||
        display_name.toLowerCase().includes('tagline')
      ) {
        return 'Subheading (h2/p) with complementary styling';
      }
      if (field.field_metadata?.multiline) {
        return 'Formatted text block with proper line spacing';
      }
      return 'Text content with appropriate typography';

    case 'number':
      return 'Styled numeric display (card, badge, or metric)';

    case 'boolean':
      return 'Toggle indicator or conditional content display';

    case 'isodate':
      return 'Formatted date display (e.g., "Published on January 1, 2024")';

    case 'file':
      if (
        display_name.toLowerCase().includes('image') ||
        display_name.toLowerCase().includes('photo')
      ) {
        return 'Featured image with proper sizing and aspect ratio';
      }
      return 'File/asset display with download link';

    case 'link':
      return 'Styled button or link with hover effects';

    case 'group':
      return 'Card or section component for grouped content';

    case 'global_field':
      return 'Nested component for global field content';

    case 'blocks':
    case 'modular_blocks':
      return 'Dynamic component renderer for modular content';

    case 'reference':
      return 'Related content cards or list';

    case 'json':
      return 'Structured data display (table, list, or custom component)';

    default:
      if (field.multiple) {
        return 'List or grid of items with cards';
      }
      return 'Styled content display';
  }
}

// Helper function to generate overall UI recommendations
function generateUIRecommendations(fields: any[], entryData: any): any {
  const hasTitle = fields.some(
    (f: any) =>
      f.uid === 'title' || f.display_name.toLowerCase().includes('title'),
  );
  const hasImage = fields.some(
    (f: any) =>
      f.data_type === 'file' &&
      (f.display_name.toLowerCase().includes('image') ||
        f.display_name.toLowerCase().includes('photo')),
  );
  const hasContent = fields.some(
    (f: any) => f.data_type === 'text' && f.field_metadata?.multiline,
  );
  const hasArrays = fields.some((f: any) => f.multiple);

  const sections: string[] = [];
  const components: string[] = [];

  if (hasTitle) {
    sections.push('Hero Section');
    components.push('HeroSection');
  }

  if (hasImage) {
    sections.push('Featured Image Section');
    components.push('FeaturedImage');
  }

  if (hasContent) {
    sections.push('Main Content Section');
    components.push('ContentSection');
  }

  if (hasArrays) {
    sections.push('Card Grid Section');
    components.push('CardGrid', 'Card');
  }

  sections.push('Metadata Section', 'Footer');
  components.push('MetadataDisplay', 'Footer');

  return {
    layout_type:
      hasImage && hasTitle
        ? 'hero-with-image'
        : hasArrays
          ? 'card-grid'
          : 'single-column',
    hero_section: hasTitle && hasImage,
    sections,
    components,
  };
}

// ======================
// PREVIEW ENTRY TOOL
// ======================

export const previewEntryTool = createTool({
  id: 'preview-contentstack-entry',
  description:
    'Previews the JSON payload that will be sent to create an entry, helping validate the structure before creation',
  inputSchema: z.object({
    content_type_uid: z
      .string()
      .describe('UID of the content type for this entry'),
    locale: z.string().default('en-us').describe('Locale for the entry'),
    entry_data: z.record(z.string(), z.any()).describe('Entry data to preview'),
  }),
  outputSchema: z.object({
    type: z.literal('entry-json'),
    content_type_uid: z.string(),
    locale: z.string(),
    json: z.object({
      entry: z.record(z.string(), z.any()),
    }),
    endpoint: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      type: 'entry-json' as const,
      content_type_uid: context.content_type_uid,
      locale: context.locale,
      json: {
        entry: context.entry_data,
      },
      endpoint: `https://api.contentstack.io/v3/content_types/${context.content_type_uid}/entries?locale=${context.locale}`,
    };
  },
});

export const createManagementTokenTool = createTool({
  id: 'create-contentstack-management-token',
  description:
    'Creates a Management Token for API write operations (content, schema, entries).',
  inputSchema: z.object({
    api_key: z.string().describe('Stack API key'),
    authtoken: z.string().describe('Auth token'),
    name: z.string().default('Management Token').describe('Name of the token'),
    description: z.string().default('Token for programmatic write access'),
    scope: z.array(z.any()).default([
      {
        module: 'environment',
        environments: ['development'],
        acl: { read: true, write: true, delete: true },
      },
    ]),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    token_uid: z.string().optional(),
    management_token: z.string().optional(),
    name: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const res = await fetch(
        'https://api.contentstack.io/v3/stacks/management_tokens',
        {
          method: 'POST',
          headers: {
            api_key: context.api_key,
            authtoken: context.authtoken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: {
              name: context.name,
              description: context.description,
              scope: context.scope,
            },
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error_message || 'Failed to create management token',
        );
      return {
        success: true,
        token_uid: data.token.uid,
        management_token: data.token.token,
        name: data.token.name,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
});
