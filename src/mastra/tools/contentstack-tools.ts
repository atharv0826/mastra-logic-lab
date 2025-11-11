import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

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
// ENTRY CREATION TOOL
// ======================

export const createEntryTool = createTool({
  id: 'create-contentstack-entry',
  description: 'Creates a new entry (content instance) for a specified content type in Contentstack',
  inputSchema: z.object({
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Stack API key (from CONTENTSTACK_API_KEY env var)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token (from CONTENTSTACK_AUTH_TOKEN env var)'),
    content_type_uid: z.string().describe('UID of the content type to create entry for'),
    entry: z
      .record(z.string(), z.any())
      .describe('Entry data object with field values matching the content type schema'),
    locale: z.string().default('en-us').describe('Locale for the entry (default: en-us)')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    entry_uid: z.string().optional(),
    title: z.string().optional(),
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
            entry: context.entry
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || data.errors || 'Failed to create entry',
          response: data
        };
      }

      return {
        success: true,
        entry_uid: data.entry.uid,
        title: data.entry.title,
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
