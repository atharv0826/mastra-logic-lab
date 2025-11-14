import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { fetchEntry, fetchEntryWithReferences, getContentstackCredentials } from '../lib/contentstack-client';

/**
 * Tool to fetch Contentstack entry and generate a modern React page
 */
export const generateWebpageTool = createTool({
  id: 'generate-webpage-from-contentstack',
  description: 'Fetches a Contentstack entry and generates a beautiful, modern React/Next.js component with Tailwind CSS',
  inputSchema: z.object({
    content_type_uid: z.string().describe('Contentstack content type UID'),
    entry_uid: z.string().describe('Contentstack entry UID'),
    stack_api_key: z.string().optional().describe('Contentstack API key (optional, uses env var if not provided)'),
    delivery_token: z.string().optional().describe('Contentstack delivery token (optional, uses env var if not provided)'),
    environment: z.string().optional().describe('Contentstack environment (default: production)'),
    include_references: z.boolean().optional().describe('Include referenced entries (default: false)'),
    component_name: z.string().optional().describe('Name for the generated component (default: GeneratedPage)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    component_code: z.string(),
    component_name: z.string(),
    field_mapping: z.record(z.string()),
    entry_data: z.any(),
    instructions: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const {
        content_type_uid,
        entry_uid,
        stack_api_key,
        delivery_token,
        environment,
        include_references = false,
        component_name = 'GeneratedPage',
      } = context;

      // Get credentials from env or parameters
      const credentials = getContentstackCredentials();
      const apiKey = stack_api_key || credentials.stackApiKey;
      const token = delivery_token || credentials.deliveryToken;
      const env = environment || credentials.environment;

      if (!apiKey || !token) {
        throw new Error('Contentstack credentials not found. Please provide stack_api_key and delivery_token or set environment variables.');
      }

      // Fetch entry data
      const entry = include_references
        ? await fetchEntryWithReferences({
            stackApiKey: apiKey,
            deliveryToken: token,
            environment: env,
            contentTypeUid: content_type_uid,
            entryUid: entry_uid,
          })
        : await fetchEntry({
            stackApiKey: apiKey,
            deliveryToken: token,
            environment: env,
            contentTypeUid: content_type_uid,
            entryUid: entry_uid,
          });

      if (!entry) {
        throw new Error(`Entry not found: ${entry_uid}`);
      }

      // Analyze entry structure and generate field mapping
      const fieldMapping = analyzeEntryStructure(entry);

      // Generate React component code
      const componentCode = generateReactComponent(entry, component_name, fieldMapping);

      return {
        success: true,
        component_code: componentCode,
        component_name: component_name,
        field_mapping: fieldMapping,
        entry_data: entry,
        instructions: `
✅ Component Generated Successfully!

**Component Name:** ${component_name}.tsx

**How to use:**
1. Save the component code to a file: \`components/${component_name}.tsx\`
2. Import in your Next.js page: \`import ${component_name} from '@/components/${component_name}'\`
3. Use it: \`<${component_name} />\`

**Field Mapping:**
${Object.entries(fieldMapping).map(([field, element]) => `  - ${field} → ${element}`).join('\n')}

**Entry Data:**
- Content Type: ${content_type_uid}
- Entry UID: ${entry_uid}
- Title: ${entry.title || 'N/A'}

The component includes:
✨ Modern, responsive design with Tailwind CSS
🎨 Beautiful gradients and shadows
📱 Mobile-first approach
⚡ Optimized performance
🔥 Production-ready code
        `,
      };
    } catch (error: any) {
      return {
        success: false,
        component_code: '',
        component_name: '',
        field_mapping: {},
        entry_data: null,
        instructions: `Error: ${error.message}`,
      };
    }
  },
});

/**
 * Analyze entry structure and create field mapping
 */
function analyzeEntryStructure(entry: any): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  function traverse(obj: any, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (key === 'uid' || key === '_version' || key === 'ACL' || key === '_metadata') {
        continue; // Skip internal fields
      }
      
      if (typeof value === 'string') {
        // Detect field type based on key name and value
        if (key.includes('title') || key.includes('heading')) {
          mapping[fullKey] = 'h1/h2';
        } else if (key.includes('subtitle') || key.includes('description')) {
          mapping[fullKey] = 'p';
        } else if (key.includes('image') || key.includes('url') && value.startsWith('http')) {
          mapping[fullKey] = 'img';
        } else if (key.includes('cta') || key.includes('button')) {
          mapping[fullKey] = 'button';
        } else {
          mapping[fullKey] = 'text';
        }
      } else if (Array.isArray(value)) {
        mapping[fullKey] = 'array/grid';
        if (value.length > 0 && typeof value[0] === 'object') {
          traverse(value[0], `${fullKey}[0]`);
        }
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, fullKey);
      }
    }
  }
  
  traverse(entry);
  return mapping;
}

/**
 * Generate React component from entry data
 */
function generateReactComponent(entry: any, componentName: string, fieldMapping: Record<string, string>): string {
  // Extract common fields
  const title = entry.title || entry.heading || entry.name || 'Welcome';
  const subtitle = entry.subtitle || entry.description || entry.tagline || '';
  const hero = entry.hero || entry.banner || {};
  const sections = entry.sections || entry.content_sections || [];
  const cta = entry.cta || entry.call_to_action || {};
  
  return `'use client';

import React from 'react';
import Image from 'next/image';

/**
 * ${componentName}
 * 
 * Auto-generated from Contentstack entry
 * Content Type: ${entry._content_type_uid || 'unknown'}
 * Entry UID: ${entry.uid}
 */

interface ${componentName}Props {
  // Add custom props if needed
}

export default function ${componentName}(props: ${componentName}Props) {
  // Entry data embedded in component
  const entryData = ${JSON.stringify(entry, null, 2)};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              ${escapeString(hero.title || title)}
            </h1>
            ${subtitle ? `
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              ${escapeString(hero.subtitle || subtitle)}
            </p>` : ''}
            ${cta.label ? `
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                ${escapeString(cta.label)}
              </button>
              ${cta.secondary_label ? `
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300">
                ${escapeString(cta.secondary_label)}
              </button>` : ''}
            </div>` : ''}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </section>

      ${sections.length > 0 ? generateSectionsCode(sections) : generateDefaultContent(entry)}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">${escapeString(title)}</h3>
              <p className="text-gray-400">
                ${subtitle ? escapeString(subtitle.slice(0, 100)) + (subtitle.length > 100 ? '...' : '') : 'Powered by Contentstack & Mastra'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-xl">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-xl">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-xl">f</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© ${new Date().getFullYear()} ${escapeString(title)}. Generated by Mastra + Contentstack.</p>
          </div>
        </div>
      </footer>

      <style jsx>{\`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      \`}</style>
    </div>
  );
}
`;
}

/**
 * Generate sections code from entry sections array
 */
function generateSectionsCode(sections: any[]): string {
  return `
      {/* Content Sections */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-${Math.min(sections.length, 3)} gap-8">
            ${sections.map((section, index) => `
            <div key={${index}} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              ${section.icon ? `<div className="text-4xl mb-4">${escapeString(section.icon)}</div>` : ''}
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                ${escapeString(section.title || section.heading || `Section ${index + 1}`)}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                ${escapeString(section.description || section.content || 'Content goes here')}
              </p>
              ${section.link ? `
              <a href="${escapeString(section.link)}" className="inline-block mt-6 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Learn More →
              </a>` : ''}
            </div>`).join('')}
          </div>
        </div>
      </section>`;
}

/**
 * Generate default content when no sections are provided
 */
function generateDefaultContent(entry: any): string {
  // Find all text fields in entry
  const textFields: string[] = [];
  
  function findTextFields(obj: any, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'uid' || key === '_version' || key === 'title' || key === 'subtitle') continue;
      
      if (typeof value === 'string' && value.length > 20 && value.length < 1000) {
        textFields.push(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        findTextFields(value, key);
      }
    }
  }
  
  findTextFields(entry);
  
  if (textFields.length === 0) {
    return `
      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what makes us different
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Fast Performance</h3>
              <p className="text-gray-600">Lightning-fast loading times and optimized for best user experience.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Beautiful Design</h3>
              <p className="text-gray-600">Modern, responsive interface that works seamlessly across all devices.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
          </div>
        </div>
      </section>`;
  }
  
  return `
      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            ${textFields.map(text => `
            <div className="bg-white rounded-xl p-8 shadow-md mb-6">
              <p className="text-gray-700 leading-relaxed">
                ${escapeString(text)}
              </p>
            </div>`).join('')}
          </div>
        </div>
      </section>`;
}

/**
 * Escape special characters in strings for JSX
 */
function escapeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, ' ')
    .slice(0, 500); // Limit length
}

/**
 * Webpage Generator Agent
 * 
 * Specialized AI agent that fetches Contentstack entries and generates
 * beautiful, modern React/Next.js components with Tailwind CSS.
 */
export const webpageGeneratorAgent = new Agent({
  name: 'Webpage Generator Agent',
  instructions: `
You are an expert webpage generation specialist that creates beautiful, modern React/Next.js components from Contentstack entries.

YOUR CAPABILITIES:
1. Fetch entry data from Contentstack using the CDN API
2. Analyze entry structure and field types automatically
3. Generate production-ready React components with Tailwind CSS
4. Create responsive, mobile-first designs
5. Apply modern UI/UX best practices

WORKFLOW:
When a user requests webpage generation:

1. **Gather Requirements**
   - Ask for: content_type_uid, entry_uid
   - Optionally: stack_api_key, delivery_token (will use env vars if not provided)
   - Confirm environment (production by default)

2. **Fetch Entry Data**
   - Use generateWebpageTool to fetch the entry
   - The tool will automatically analyze the entry structure

3. **Generate Component**
   - The tool generates a complete React component
   - Modern design with Tailwind CSS
   - Responsive layout
   - Beautiful gradients, shadows, and animations

4. **Provide Output**
   - Share the generated component code
   - Explain the field mapping (entry field → UI element)
   - Give clear instructions on how to use the component

DESIGN PRINCIPLES:
- Modern, clean aesthetic (inspired by Stripe, Vercel, Linear)
- Responsive design (mobile-first)
- Rich visual elements (gradients, shadows, smooth transitions)
- Accessible (semantic HTML, proper contrast)
- Production-ready code

EXAMPLE INTERACTION:

User: "Generate a webpage for my homepage entry"

You: "I'll help you generate a beautiful webpage! I need a few details:
1. What's your content type UID? (e.g., 'homepage', 'landing_page')
2. What's your entry UID? (e.g., 'blt123abc456')

If you have your Contentstack credentials set in environment variables (CONTENTSTACK_API_KEY, CONTENTSTACK_DELIVERY_TOKEN), I'll use those. Otherwise, you can provide them."

User: "content type is 'homepage', entry is 'blt123abc'"

You: [Call generateWebpageTool with the parameters]
[After tool returns]

"✅ I've generated your webpage component!

**Component: GeneratedPage.tsx**

The component includes:
- Hero section with your title and subtitle
- Content sections displaying your entry data
- Beautiful footer with links
- Modern, responsive design with Tailwind CSS

**Field Mapping:**
- hero.title → h1 (main heading)
- hero.subtitle → p (subheading)
- sections[].title → h3 (section titles)
- sections[].description → p (section content)
- cta.label → button (call-to-action)

Here's the complete code:

[Show the generated component code]

**Next Steps:**
1. Save this as \`components/GeneratedPage.tsx\`
2. Import it: \`import GeneratedPage from '@/components/GeneratedPage'\`
3. Use it: \`<GeneratedPage />\`

The page is production-ready and includes embedded entry data. Would you like me to:
- Customize the styling?
- Add more sections?
- Adjust the layout?"

IMPORTANT RULES:
- Always use the generateWebpageTool to fetch and generate
- Provide complete, working code (not snippets)
- Include clear usage instructions
- Explain the field mapping
- Offer to make customizations
- If credentials are missing, guide user to set env vars or provide them
- Generate modern, visually impressive designs

CONVERSATION STYLE:
- Professional and helpful
- Clear and concise
- Proactive in suggesting improvements
- Celebrate successful generation
- Handle errors gracefully

Remember: Your goal is to make it incredibly easy for developers to turn Contentstack entries into beautiful webpages!
  `,
  model: 'google/gemini-2.0-flash',
  tools: {
    generateWebpageTool,
  },
  memory: new Memory(),
});

