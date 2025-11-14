import { mastra } from '../src/mastra';

const CONTENTSTACK_CONFIG = {
  api_key: process.env.CONTENTSTACK_API_KEY || '',
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN || '',
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'production',
  region: process.env.CONTENTSTACK_REGION || 'us',
};

async function generateShoesHomePage() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Website Builder - Shoes Home Page    ║');
  console.log('╚════════════════════════════════════════╝\n');

  const websiteAgent = mastra.agents.websiteBuilderAgent;

  const prompt = `Create a beautiful single-page website for a Shoes Home Page in app.tsx.

The website should:
1. Be a complete single-page application with ALL code in app.tsx
2. Use React and Tailwind CSS
3. Integrate with Contentstack CMS using the "shoes_home_page" content type
4. Include Contentstack Live Preview SDK for real-time editing

Content Type Schema:
- Content Type UID: shoes_home_page
- Fields:
  * title (text): Page title
  * url (text): Page URL
  * hero_title (text): Main hero section title
  * hero_description (text): Hero section description
  * hero_image (file): Hero section background/featured image
  * featured_products (modular blocks): Array of product cards with:
    - product_name (text)
    - product_image (file)
    - product_price (number)

Design Requirements:
- Modern, beautiful gradient background (purple, blue, pink tones)
- Responsive layout that works on mobile, tablet, and desktop
- Hero section with large title, description, and CTA button
- Featured products grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Product cards with hover effects, images, names, and prices
- Smooth animations and transitions
- Professional typography with good spacing

Technical Requirements:
1. Initialize Contentstack SDK with API key, delivery token, environment
2. Fetch entry from "shoes_home_page" content type
3. Add Live Preview SDK integration with data-cslp attributes for all editable fields
4. Handle loading and error states
5. Format prices as currency ($)
6. Optimize images with proper alt text and responsive sizes
7. Add a footer with copyright info

Make it production-ready, beautiful, and fully functional with all code in a single app.tsx file.`;

  console.log('Generating website code...\n');

  const response = await websiteAgent.generate([
    {
      role: 'user',
      content: prompt,
    },
  ]);

  console.log('Generated Code:\n');
  console.log('═'.repeat(80));
  console.log(response.text);
  console.log('═'.repeat(80));

  console.log('\n✅ Website code generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Copy the app.tsx code above');
  console.log('2. Create a new Next.js or React project');
  console.log(
    '3. Install dependencies: npm install contentstack @contentstack/live-preview-utils',
  );
  console.log('4. Set up environment variables:');
  console.log(
    `   - NEXT_PUBLIC_CONTENTSTACK_API_KEY=${CONTENTSTACK_CONFIG.api_key || 'your_api_key'}`,
  );
  console.log(
    `   - NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=${CONTENTSTACK_CONFIG.delivery_token || 'your_delivery_token'}`,
  );
  console.log(
    `   - NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=${CONTENTSTACK_CONFIG.environment}`,
  );
  console.log(
    '5. Create an entry in Contentstack for the shoes_home_page content type',
  );
  console.log('6. Run your development server and enjoy!\n');

  return response.text;
}

async function generateWithCustomPrompt(userPrompt: string) {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Website Builder - Custom Page        ║');
  console.log('╚════════════════════════════════════════╝\n');

  const websiteAgent = mastra.agents.websiteBuilderAgent;

  console.log('User Request:', userPrompt);
  console.log('\nGenerating website code...\n');

  const response = await websiteAgent.generate([
    {
      role: 'user',
      content: userPrompt,
    },
  ]);

  console.log('Generated Code:\n');
  console.log('═'.repeat(80));
  console.log(response.text);
  console.log('═'.repeat(80));

  return response.text;
}

async function generateMultiStepConversation() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Website Builder - Conversation       ║');
  console.log('╚════════════════════════════════════════╝\n');

  const websiteAgent = mastra.agents.websiteBuilderAgent;
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  console.log('Step 1: Initial request\n');
  const step1Message = {
    role: 'user' as const,
    content: 'I want to build a shoes e-commerce homepage',
  };
  messages.push(step1Message);

  const response1 = await websiteAgent.generate(messages);
  messages.push({ role: 'assistant', content: response1.text });
  console.log('Agent:', response1.text);
  console.log('\n---\n');

  console.log('Step 2: Provide details\n');
  const step2Message = {
    role: 'user' as const,
    content: `Yes, integrate with Contentstack. Use the "shoes_home_page" content type with:
    - Hero section (title, description, image)
    - Featured products grid (name, image, price)
    Create everything in a single app.tsx file with a modern, gradient design.`,
  };
  messages.push(step2Message);

  const response2 = await websiteAgent.generate(messages);
  console.log('Agent:', response2.text);
  console.log('\n---\n');

  return response2.text;
}

async function main() {
  const mode = process.argv[2] || 'shoes';
  const customPrompt = process.argv.slice(3).join(' ');

  try {
    switch (mode) {
      case 'shoes':
        await generateShoesHomePage();
        break;
      case 'custom':
        if (!customPrompt) {
          console.log('Error: Please provide a prompt for custom mode');
          console.log('Usage: npm run website custom "Your prompt here"');
          return;
        }
        await generateWithCustomPrompt(customPrompt);
        break;
      case 'conversation':
        await generateMultiStepConversation();
        break;
      default:
        console.log('\nUsage: npm run website [mode] [options]');
        console.log('\nModes:');
        console.log('  shoes         - Generate shoes home page (default)');
        console.log('  custom        - Generate custom page with your prompt');
        console.log('  conversation  - Multi-step conversation example');
        console.log('\nExamples:');
        console.log('  npm run website shoes');
        console.log('  npm run website custom "Create a portfolio homepage"');
        console.log('  npm run website conversation');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateShoesHomePage,
  generateWithCustomPrompt,
  generateMultiStepConversation,
};
