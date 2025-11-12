/**
 * Contentstack Onboarding Example
 * 
 * This example demonstrates how to use the Contentstack onboarding system
 * to create a complete stack with content models.
 */

import { mastra } from '../src/mastra';

// Configuration - Loaded from environment variables
const CONTENTSTACK_CONFIG = {
  authtoken: process.env.CONTENTSTACK_AUTH_TOKEN || '',
  organization_uid: process.env.CONTENTSTACK_ORG_ID || '',
  api_key: process.env.CONTENTSTACK_API_KEY || '',
};

/**
 * Example 1: Using the Onboarding Agent (Conversational)
 * 
 * This is the recommended approach for interactive onboarding
 */
async function conversationalOnboarding() {
  console.log('\n=== Example 1: Conversational Onboarding ===\n');

  const agent = mastra.agents.onboardingAgent;

  // Start the conversation
  console.log('User: I want to create a blog website\n');

  const response1 = await agent.generate([
    {
      role: 'user',
      content: 'I want to create a blog website'
    }
  ]);

  console.log('Agent:', response1.text);
  console.log('\n---\n');

  // Continue with more details
  console.log('User: It will have blog posts with authors, categories, and a home page. Each post needs SEO fields.\n');

  const response2 = await agent.generate([
    {
      role: 'user',
      content: 'I want to create a blog website'
    },
    {
      role: 'assistant',
      content: response1.text
    },
    {
      role: 'user',
      content: 'It will have blog posts with authors, categories, and a home page. Each post needs SEO fields.'
    }
  ]);

  console.log('Agent:', response2.text);
  console.log('\n---\n');

  // Provide credentials and stack details
  console.log('User: Stack name: "My Blog", Description: "Personal blog website"\n');

  const response3 = await agent.generate([
    {
      role: 'user',
      content: 'I want to create a blog website'
    },
    {
      role: 'assistant',
      content: response1.text
    },
    {
      role: 'user',
      content: 'It will have blog posts with authors, categories, and a home page. Each post needs SEO fields.'
    },
    {
      role: 'assistant',
      content: response2.text
    },
    {
      role: 'user',
      content: `Stack name: "My Blog", Description: "Personal blog website". 
                My authtoken is ${CONTENTSTACK_CONFIG.authtoken} 
                and organization_uid is ${CONTENTSTACK_CONFIG.organization_uid}`
    }
  ]);

  console.log('Agent:', response3.text);
}

/**
 * Example 2: Using the Workflow Directly
 * 
 * Use this approach when you have all information upfront
 */
async function workflowOnboarding() {
  console.log('\n=== Example 2: Direct Workflow Execution ===\n');

  // Step 1: Generate content model using Content Modeling Agent
  console.log('Step 1: Generating content model schema...\n');

  const contentModelingAgent = mastra.agents.contentModelingAgent;

  const schemaResponse = await contentModelingAgent.generate([
    {
      role: 'user',
      content: `Create a content model for a blog website with:
        - Blog posts with rich content, featured images, and publication dates
        - Author profiles
        - Blog categories
        - A home page with featured posts
        Include SEO metadata as a global field that can be used across all content types.`
    }
  ]);

  console.log('Generated schema:\n');
  console.log(schemaResponse.text);
  console.log('\n---\n');

  // Parse the generated schema
  const contentModel = JSON.parse(schemaResponse.text);

  // Step 2: Execute the workflow
  console.log('Step 2: Creating stack and content models...\n');

  const workflow = mastra.workflows.onboardingWorkflow;

  try {
    const result = await workflow.execute({
      triggerData: {
        user_requirements: 'Blog website with posts, authors, and categories',
        stack_name: 'My Blog Platform',
        stack_description: 'Content management for personal blog with SEO optimization',
        authtoken: CONTENTSTACK_CONFIG.authtoken,
        organization_uid: CONTENTSTACK_CONFIG.organization_uid,
        master_locale: 'en-us',
        content_model: contentModel,
      }
    });

    console.log('Workflow completed!\n');
    console.log(JSON.stringify(result, null, 2));

    // Extract useful information
    const summary = result as any;
    console.log('\n=== Summary ===');
    console.log(`✓ Stack created: ${summary.stack.name} (${summary.stack.uid})`);
    console.log(`✓ API Key: ${summary.stack.api_key}`);
    console.log(`✓ Global fields created: ${summary.statistics.global_fields_created}`);
    console.log(`✓ Content types created: ${summary.statistics.content_types_created}`);
    
    console.log('\nGlobal Fields:');
    summary.global_fields.forEach((gf: any) => {
      console.log(`  - ${gf.title} (${gf.uid}) - ${gf.status}`);
    });

    console.log('\nContent Types:');
    summary.content_types.forEach((ct: any) => {
      console.log(`  - ${ct.title} (${ct.uid}) - ${ct.status}`);
    });

  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

/**
 * Example 3: Using Individual Tools
 * 
 * Use this for maximum control over the process
 */
async function manualOnboarding() {
  console.log('\n=== Example 3: Manual Tool Usage ===\n');

  const { 
    createStackTool, 
    createGlobalFieldTool, 
    createContentTypeTool 
  } = await import('../src/mastra/tools/contentstack-tools');

  // Step 1: Create Stack
  console.log('Step 1: Creating stack...\n');

  const stackResult = await createStackTool.execute({
    context: {
      name: 'Manual Blog Setup',
      description: 'Manually configured blog stack',
      authtoken: CONTENTSTACK_CONFIG.authtoken,
      organization_uid: CONTENTSTACK_CONFIG.organization_uid,
      master_locale: 'en-us',
    }
  });

  if (!stackResult.success) {
    console.error('Failed to create stack:', stackResult.error);
    return;
  }

  console.log(`✓ Stack created: ${stackResult.name}`);
  console.log(`  UID: ${stackResult.stack_uid}`);
  console.log(`  API Key: ${stackResult.api_key}\n`);

  const { api_key } = stackResult;

  // Step 2: Create Global Field (SEO)
  console.log('Step 2: Creating SEO global field...\n');

  const globalFieldResult = await createGlobalFieldTool.execute({
    context: {
      api_key: api_key!,
      authtoken: CONTENTSTACK_CONFIG.authtoken,
      global_field: {
        title: 'SEO Metadata',
        uid: 'seo_metadata',
        description: 'SEO fields for pages and posts',
        schema: [
          {
            display_name: 'Title',
            uid: 'title',
            data_type: 'text',
            mandatory: true,
            unique: true,
            field_metadata: { _default: true },
            multiple: false
          },
          {
            data_type: 'text',
            display_name: 'Meta Title',
            uid: 'meta_title',
            field_metadata: { 
              description: 'SEO title tag',
              default_value: ''
            },
            multiple: false,
            mandatory: false,
            unique: false
          },
          {
            data_type: 'text',
            display_name: 'Meta Description',
            uid: 'meta_description',
            field_metadata: { 
              description: 'SEO description',
              default_value: '',
              multiline: true
            },
            multiple: false,
            mandatory: false,
            unique: false
          }
        ]
      }
    }
  });

  if (globalFieldResult.success) {
    console.log(`✓ Global field created: ${globalFieldResult.title} (${globalFieldResult.global_field_uid})\n`);
  } else {
    console.error('Failed to create global field:', globalFieldResult.error);
  }

  // Step 3: Create Content Type (Blog Post)
  console.log('Step 3: Creating Blog Post content type...\n');

  const contentTypeResult = await createContentTypeTool.execute({
    context: {
      api_key: api_key!,
      authtoken: CONTENTSTACK_CONFIG.authtoken,
      content_type: {
        title: 'Blog Post',
        uid: 'blog_post',
        description: 'Blog post with rich content and SEO',
        schema: [
          {
            display_name: 'Title',
            uid: 'title',
            data_type: 'text',
            mandatory: true,
            unique: true,
            field_metadata: { _default: true },
            multiple: false
          },
          {
            display_name: 'URL',
            uid: 'url',
            data_type: 'text',
            mandatory: true,
            field_metadata: { _default: true },
            multiple: false,
            unique: false
          },
          {
            data_type: 'text',
            display_name: 'Subtitle',
            uid: 'subtitle',
            field_metadata: { 
              description: 'Post subtitle or summary',
              default_value: ''
            },
            multiple: false,
            mandatory: false,
            unique: false
          },
          {
            data_type: 'text',
            display_name: 'Body Content',
            uid: 'body_content',
            field_metadata: {
              description: 'Main post content',
              allow_rich_text: true,
              rich_text_type: 'advanced'
            },
            multiple: false,
            mandatory: true,
            unique: false
          },
          {
            data_type: 'file',
            display_name: 'Featured Image',
            uid: 'featured_image',
            extensions: [],
            field_metadata: { 
              description: 'Post header image' 
            },
            multiple: false,
            mandatory: false,
            unique: false
          },
          {
            data_type: 'isodate',
            display_name: 'Publication Date',
            uid: 'publication_date',
            field_metadata: { 
              description: 'When to publish this post' 
            },
            multiple: false,
            mandatory: false,
            unique: false
          },
          {
            data_type: 'global_field',
            display_name: 'SEO',
            reference_to: 'seo_metadata',
            uid: 'seo',
            mandatory: false,
            multiple: false,
            unique: false
          }
        ]
      }
    }
  });

  if (contentTypeResult.success) {
    console.log(`✓ Content type created: ${contentTypeResult.title} (${contentTypeResult.content_type_uid})\n`);
  } else {
    console.error('Failed to create content type:', contentTypeResult.error);
  }

  console.log('=== Manual onboarding complete! ===');
}

/**
 * Example 4: E-commerce Site
 */
async function ecommerceExample() {
  console.log('\n=== Example 4: E-commerce Site ===\n');

  const contentModelingAgent = mastra.agents.contentModelingAgent;

  const schemaResponse = await contentModelingAgent.generate([
    {
      role: 'user',
      content: `Create an e-commerce content model with:
        - Products (name, SKU, price, images, description, stock quantity)
        - Product categories
        - A home page with hero section and featured products
        - About page
        Include Header, Footer, and SEO as global fields.`
    }
  ]);

  console.log('Generated E-commerce Schema:\n');
  console.log(schemaResponse.text);
}

// Main execution
async function main() {
  const example = process.argv[2] || '1';

  console.log('╔════════════════════════════════════════╗');
  console.log('║  Contentstack Onboarding Examples     ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    switch (example) {
      case '1':
        await conversationalOnboarding();
        break;
      case '2':
        await workflowOnboarding();
        break;
      case '3':
        await manualOnboarding();
        break;
      case '4':
        await ecommerceExample();
        break;
      default:
        console.log('\nUsage: npm run example [1|2|3|4]');
        console.log('  1 - Conversational onboarding (recommended)');
        console.log('  2 - Direct workflow execution');
        console.log('  3 - Manual tool usage');
        console.log('  4 - E-commerce schema generation');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  conversationalOnboarding, 
  workflowOnboarding, 
  manualOnboarding,
  ecommerceExample 
};

