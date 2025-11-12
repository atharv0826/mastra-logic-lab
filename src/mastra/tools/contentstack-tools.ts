import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// ======================
// STACK PREVIEW TOOL
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

// ======================
// STACK CREATION TOOL
// ======================

export const createStackTool = createTool({
  id: 'create-contentstack-stack',
  description: 'Creates a new Contentstack stack with the provided name and description',
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
    success: z.boolean(),
    stack_uid: z.string().optional(),
    api_key: z.string().optional(),
    name: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional()
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch('https://api.contentstack.io/v3/stacks', {
        method: 'POST',
        headers: {
          authtoken: context.authtoken,
          organization_uid: context.organization_uid,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stack: {
            name: context.name,
            description: context.description,
            master_locale: context.master_locale
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to create stack',
          response: data
        };
      }

      return {
        success: true,
        stack_uid: data.stack.uid,
        api_key: data.stack.api_key,
        name: data.stack.name,
        response: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

// ======================
// GLOBAL FIELD CREATION TOOL
// ======================

export const createGlobalFieldTool = createTool({
  id: 'create-contentstack-global-field',
  description: 'Creates a reusable global field in Contentstack that can be referenced in multiple content types',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    global_field: z.object({
      title: z.string().describe('Title of the global field'),
      uid: z.string().describe('Unique identifier for the global field'),
      description: z.string().optional().describe('Description of the global field'),
      schema: z.array(z.any()).describe('Array of field definitions')
    })
  }),
  outputSchema: z.object({
    success: z.boolean(),
    global_field_uid: z.string().optional(),
    title: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional()
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch('https://api.contentstack.io/v3/global_fields', {
        method: 'POST',
        headers: {
          api_key: context.api_key,
          authtoken: context.authtoken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          global_field: context.global_field
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to create global field',
          response: data
        };
      }

      return {
        success: true,
        global_field_uid: data.global_field.uid,
        title: data.global_field.title,
        response: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

// ======================
// CONTENT TYPE CREATION TOOL
// ======================

export const createContentTypeTool = createTool({
  id: 'create-contentstack-content-type',
  description: 'Creates a content type (content model) in Contentstack with the specified schema',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    content_type: z.object({
      title: z.string().describe('Title of the content type'),
      uid: z.string().describe('Unique identifier for the content type'),
      description: z.string().optional().describe('Description of the content type'),
      schema: z.array(z.any()).describe('Array of field definitions including title and url fields')
    })
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content_type_uid: z.string().optional(),
    title: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional()
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch('https://api.contentstack.io/v3/content_types', {
        method: 'POST',
        headers: {
          api_key: context.api_key,
          authtoken: context.authtoken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content_type: context.content_type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to create content type',
          response: data
        };
      }

      return {
        success: true,
        content_type_uid: data.content_type.uid,
        title: data.content_type.title,
        response: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

// ======================
// CONTENT MODEL PREVIEW TOOL
// ======================

export const previewContentModelTool = createTool({
  id: 'preview-contentstack-content-model',
  description: 'Uses Contentstack AI to generate and preview content types and global fields based on requirements',
  inputSchema: z.object({
    instruction: z.string().describe('Structured instruction describing the content model requirements'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)')
  }),
  outputSchema: z.object({
    type: z.literal('content-model-json'),
    json: z.object({
      global_fields: z.array(z.any()),
      content_types: z.array(z.any())
    })
  }),
  execute: async ({ context }) => {
    try {
      // Create form data with the instruction
      const formData = new FormData();
      formData.append('instruction', context.instruction);

      const response = await fetch('https://ai.contentstack.com/ask-ai/content-model', {
        method: 'POST',
        headers: {
          authtoken: context.authtoken,
          accept: '*/*'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        type: 'content-model-json' as const,
        json: {
          global_fields: data.global_fields || [],
          content_types: data.content_types || []
        }
      };
    } catch (error) {
      // Return empty arrays on error so the structure is maintained
      console.error('Error generating content model:', error);
      return {
        type: 'content-model-json' as const,
        json: {
          global_fields: [],
          content_types: []
        }
      };
    }
  }
});

// ======================
// CONVERSATION TOOL - For gathering requirements
// ======================

export const gatherRequirementsTool = createTool({
  id: 'gather-user-requirements',
  description: 'Gathers and structures user requirements for their digital experience',
  inputSchema: z.object({
    user_input: z.string().describe('User description of what they want to build'),
    conversation_history: z.array(z.string()).optional().describe('Previous conversation messages')
  }),
  outputSchema: z.object({
    project_type: z.string().optional().describe('Type of project (website, blog, e-commerce, etc)'),
    features: z.array(z.string()).optional().describe('List of features user wants'),
    needs_clarification: z.boolean().describe('Whether more information is needed'),
    clarification_questions: z.array(z.string()).optional().describe('Questions to ask the user'),
    is_ready: z.boolean().describe('Whether we have enough info to proceed'),
    summary: z.string().describe('Summary of what will be built')
  }),
  execute: async ({ context }) => {
    // This tool structures the conversation but the actual analysis
    // should be done by the agent's reasoning
    return {
      needs_clarification: false,
      is_ready: true,
      summary: context.user_input
    };
  }
});

// ======================
// GET CONTENT TYPE SCHEMA TOOL
// ======================

export const getContentTypeSchema = createTool({
  id: 'get-content-type-schema',
  description: 'Fetches the schema of a content type to understand its structure, including global fields. Use this before creating entries to know what fields are required.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    content_type_uid: z.string().describe('UID of the content type to fetch')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content_type: z.object({
      title: z.string(),
      uid: z.string(),
      description: z.string().optional(),
      schema: z.array(z.any())
    }).optional(),
    field_summary: z.object({
      required_fields: z.array(z.string()),
      optional_fields: z.array(z.string()),
      global_fields: z.array(z.object({
        uid: z.string(),
        reference_to: z.string(),
        display_name: z.string(),
        mandatory: z.boolean()
      }))
    }).optional(),
    error: z.string().optional()
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
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to fetch content type schema'
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
            mandatory: field.mandatory || false
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
          schema: schema
        },
        field_summary: {
          required_fields,
          optional_fields,
          global_fields
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

// ======================
// CREATE ENTRY TOOL
// ======================

export const createEntryTool = createTool({
  id: 'create-contentstack-entry',
  description: 'Creates an entry (content instance) for a specific content type. Intelligently handles global fields as nested objects. The entry_data should match the content type schema.',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    content_type_uid: z.string().describe('UID of the content type for this entry'),
    locale: z.string().default('en-us').describe('Locale for the entry (default: en-us)'),
    entry_data: z.record(z.string(), z.any()).describe('Entry data as key-value pairs. Global fields should be nested objects with their field data.')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    entry_uid: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional(),
    notice: z.string().optional(),
    error: z.string().optional(),
    response: z.any().optional()
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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            entry: context.entry_data
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || JSON.stringify(data.errors) || 'Failed to create entry',
          response: data
        };
      }

      return {
        success: true,
        entry_uid: data.entry.uid,
        title: data.entry.title,
        url: data.entry.url,
        notice: data.notice,
        response: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

// ======================
// PREVIEW ENTRY TOOL
// ======================

export const previewEntryTool = createTool({
  id: 'preview-contentstack-entry',
  description: 'Previews the JSON payload that will be sent to create an entry, helping validate the structure before creation',
  inputSchema: z.object({
    content_type_uid: z.string().describe('UID of the content type for this entry'),
    locale: z.string().default('en-us').describe('Locale for the entry'),
    entry_data: z.record(z.string(), z.any()).describe('Entry data to preview')
  }),
  outputSchema: z.object({
    type: z.literal('entry-json'),
    content_type_uid: z.string(),
    locale: z.string(),
    json: z.object({
      entry: z.record(z.string(), z.any())
    }),
    endpoint: z.string()
  }),
  execute: async ({ context }) => {
    return {
      type: 'entry-json' as const,
      content_type_uid: context.content_type_uid,
      locale: context.locale,
      json: {
        entry: context.entry_data
      },
      endpoint: `https://api.contentstack.io/v3/content_types/${context.content_type_uid}/entries?locale=${context.locale}`
    };
  }
});
