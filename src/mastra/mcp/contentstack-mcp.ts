import { MastraMCPClient } from '@mastra/mcp';

// Initialize Contentstack MCP Client
export const contentstackMCP = new MastraMCPClient({
  name: 'contentstack-client',
  version: '1.0.0',
  server: {
    command: 'npx',
    args: ['-y', '@contentstack/mcp'],
    env: {
      CONTENTSTACK_API_KEY: process.env.CONTENTSTACK_API_KEY || 'blt5904e40a8a9a8328',
      CONTENTSTACK_DELIVERY_TOKEN: process.env.CONTENTSTACK_DELIVERY_TOKEN || 'csa6e0d43e3ce7ea44069aa0fa',
      CONTENTSTACK_BRAND_KIT_ID: process.env.CONTENTSTACK_BRAND_KIT_ID || '',
      CONTENTSTACK_LAUNCH_PROJECT_ID: process.env.CONTENTSTACK_LAUNCH_PROJECT_ID || '',
      CONTENTSTACK_PERSONALIZE_PROJECT_ID: process.env.CONTENTSTACK_PERSONALIZE_PROJECT_ID || '',
      LYTICS_ACCESS_TOKEN: process.env.LYTICS_ACCESS_TOKEN || '',
      GROUPS: process.env.CONTENTSTACK_GROUPS || 'cda', // Content Delivery API
    },
  },
});

// Helper function to get all Contentstack tools
export async function getContentstackTools() {
  try {
    await contentstackMCP.connect();
    const tools = await contentstackMCP.tools();
    return tools;
  } catch (error) {
    console.error('Failed to load Contentstack MCP tools:', error);
    return {};
  }
}

