/**
 * Webpage Generator Agent Example
 * 
 * This example demonstrates how to use the Webpage Generator Agent
 * to dynamically create modern React/Next.js components from Contentstack entries.
 */

import { mastra } from '../src/mastra';

async function example1_GenerateFromEntry() {
  console.log('\n📄 Example 1: Generate webpage from Contentstack entry\n');

  const agent = mastra.getAgent('webpageGeneratorAgent');

  const result = await agent.generate(
    'Generate a beautiful webpage for my homepage. Content type UID is "homepage" and entry UID is "blt123abc456"',
  );

  console.log('Agent Response:', result.text);
}

async function example2_ConversationalFlow() {
  console.log('\n💬 Example 2: Conversational flow\n');

  const agent = mastra.getAgent('webpageGeneratorAgent');

  // Step 1: Initial request
  const thread = await agent.thread({
    resourceid: 'webpage-gen-session-1',
    context: {
      user_id: 'dev-123',
    },
  });

  const response1 = await agent.generate(
    'I want to create a webpage from my Contentstack entry',
    { threadId: thread.id },
  );

  console.log('Agent:', response1.text);

  // Step 2: Provide details
  const response2 = await agent.generate(
    'The content type is "landing_page" and entry UID is "blt789xyz"',
    { threadId: thread.id },
  );

  console.log('\nAgent:', response2.text);
}

async function example3_WithCredentials() {
  console.log('\n🔐 Example 3: Generate with explicit credentials\n');

  const agent = mastra.getAgent('webpageGeneratorAgent');

  const result = await agent.generate(
    `Generate a webpage with these details:
    - Content Type: product_page
    - Entry UID: blt123product
    - Stack API Key: blt5904e40a8a9a8328
    - Delivery Token: csa6e0d43e3ce7ea44069aa0fa
    - Environment: production
    `,
  );

  console.log('Agent Response:', result.text);
}

async function example4_DirectToolUsage() {
  console.log('\n🔧 Example 4: Direct tool usage\n');

  const agent = mastra.getAgent('webpageGeneratorAgent');

  // Access the tool directly from the agent
  const tools = agent.getTools();
  const generateTool = tools.find(t => t.id === 'generate-webpage-from-contentstack');

  if (generateTool) {
    const result = await generateTool.execute({
      context: {
        content_type_uid: 'homepage',
        entry_uid: 'blt123abc456',
        component_name: 'Homepage',
        include_references: true,
      },
    });

    console.log('Success:', result.success);
    console.log('Component Name:', result.component_name);
    console.log('Field Mapping:', result.field_mapping);
    console.log('\nComponent Code Preview:');
    console.log(result.component_code.slice(0, 500) + '...\n');
    console.log('Instructions:', result.instructions);
  }
}

async function example5_CustomComponentName() {
  console.log('\n✨ Example 5: Generate with custom component name\n');

  const agent = mastra.getAgent('webpageGeneratorAgent');

  const result = await agent.generate(
    `Create a component named "ProductShowcase" from the entry:
    - Content Type: product_showcase
    - Entry UID: blt456showcase
    - Include all references
    `,
  );

  console.log('Agent Response:', result.text);
}

async function example6_ErrorHandling() {
  console.log('\n❌ Example 6: Error handling\n');

  const agent = mastra.getAgent('webpageGeneratorAgent');

  try {
    // This will fail because entry doesn't exist
    const result = await agent.generate(
      'Generate webpage for content type "nonexistent" and entry "blt999invalid"',
    );

    console.log('Agent Response:', result.text);
  } catch (error: any) {
    console.log('Error handled gracefully:', error.message);
  }
}

// Main execution
async function runExamples() {
  console.log('🚀 Webpage Generator Agent Examples\n');
  console.log('Note: Make sure to set your Contentstack credentials in .env:');
  console.log('  - CONTENTSTACK_API_KEY');
  console.log('  - CONTENTSTACK_DELIVERY_TOKEN');
  console.log('  - CONTENTSTACK_ENVIRONMENT (optional, defaults to "production")');
  console.log('  - CONTENTSTACK_REGION (optional, defaults to "us")\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    // Run examples (comment out the ones you don't want to test)
    await example1_GenerateFromEntry();
    // await example2_ConversationalFlow();
    // await example3_WithCredentials();
    // await example4_DirectToolUsage();
    // await example5_CustomComponentName();
    // await example6_ErrorHandling();
  } catch (error: any) {
    console.error('Example error:', error.message);
  }
}

// Uncomment to run
// runExamples();

/**
 * USAGE GUIDE
 * ===========
 * 
 * 1. SET UP ENVIRONMENT VARIABLES (.env file):
 * 
 *    CONTENTSTACK_API_KEY=blt5904e40a8a9a8328
 *    CONTENTSTACK_DELIVERY_TOKEN=csa6e0d43e3ce7ea44069aa0fa
 *    CONTENTSTACK_ENVIRONMENT=production
 *    CONTENTSTACK_REGION=us
 * 
 * 
 * 2. RUN THE AGENT CONVERSATIONALLY:
 * 
 *    const agent = mastra.getAgent('webpageGeneratorAgent');
 *    const result = await agent.generate('Generate a webpage for my homepage entry');
 * 
 * 
 * 3. USE THE TOOL DIRECTLY:
 * 
 *    const tools = agent.getTools();
 *    const generateTool = tools.find(t => t.id === 'generate-webpage-from-contentstack');
 *    const result = await generateTool.execute({
 *      context: {
 *        content_type_uid: 'homepage',
 *        entry_uid: 'blt123abc',
 *        component_name: 'Homepage'
 *      }
 *    });
 * 
 * 
 * 4. GENERATED OUTPUT:
 * 
 *    The agent returns:
 *    - Complete React/Next.js component code
 *    - Field mapping (entry field → UI element)
 *    - Entry data (for reference)
 *    - Usage instructions
 * 
 * 
 * 5. SAVE AND USE THE COMPONENT:
 * 
 *    // Save the generated code to a file
 *    import fs from 'fs';
 *    fs.writeFileSync('components/GeneratedPage.tsx', result.component_code);
 * 
 *    // Use it in your Next.js app
 *    import GeneratedPage from '@/components/GeneratedPage';
 *    
 *    export default function Home() {
 *      return <GeneratedPage />;
 *    }
 * 
 * 
 * 6. FEATURES:
 * 
 *    ✅ Automatic entry fetching from Contentstack
 *    ✅ Modern, responsive design with Tailwind CSS
 *    ✅ Beautiful gradients, shadows, and animations
 *    ✅ Mobile-first approach
 *    ✅ Production-ready code
 *    ✅ Embedded entry data (no runtime API calls needed)
 *    ✅ Customizable component names
 *    ✅ Support for complex entry structures
 *    ✅ Automatic field type detection and mapping
 * 
 * 
 * 7. FIELD MAPPING:
 * 
 *    The agent automatically maps Contentstack fields to UI elements:
 *    
 *    Entry Field            →  UI Element
 *    ─────────────────────────────────────
 *    title, heading         →  h1/h2
 *    subtitle, description  →  p
 *    image, url             →  img
 *    cta, button            →  button
 *    sections[]             →  grid/cards
 *    content                →  prose
 * 
 * 
 * 8. CUSTOMIZATION:
 * 
 *    You can customize the generated component by:
 *    - Asking the agent to adjust styling
 *    - Modifying the generated code directly
 *    - Requesting specific layouts or sections
 *    - Adding custom animations or interactions
 * 
 * 
 * 9. API REFERENCE:
 * 
 *    generateWebpageTool:
 *    
 *    Input:
 *    - content_type_uid: string (required)
 *    - entry_uid: string (required)
 *    - stack_api_key: string (optional, uses env var)
 *    - delivery_token: string (optional, uses env var)
 *    - environment: string (optional, default: 'production')
 *    - include_references: boolean (optional, default: false)
 *    - component_name: string (optional, default: 'GeneratedPage')
 *    
 *    Output:
 *    - success: boolean
 *    - component_code: string (full React component)
 *    - component_name: string
 *    - field_mapping: Record<string, string>
 *    - entry_data: any
 *    - instructions: string
 * 
 * 
 * 10. TROUBLESHOOTING:
 * 
 *     Q: "Entry not found" error?
 *     A: Check your entry UID and ensure the entry exists in the specified environment.
 *     
 *     Q: "Credentials not found" error?
 *     A: Set CONTENTSTACK_API_KEY and CONTENTSTACK_DELIVERY_TOKEN in your .env file.
 *     
 *     Q: Generated component doesn't render correctly?
 *     A: Ensure you have Tailwind CSS configured in your Next.js project.
 *     
 *     Q: Want to customize the design?
 *     A: Ask the agent to regenerate with specific styling requirements.
 */

export {
  example1_GenerateFromEntry,
  example2_ConversationalFlow,
  example3_WithCredentials,
  example4_DirectToolUsage,
  example5_CustomComponentName,
  example6_ErrorHandling,
  runExamples,
};

