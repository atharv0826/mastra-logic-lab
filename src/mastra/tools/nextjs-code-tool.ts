import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { nextjsCodeAgent } from '../agents/nextjs-code-agent';

/**
 * Next.js Code Generator Tool
 * 
 * This tool wraps the Next.js Code Generator Agent, allowing other agents
 * (like the onboarding agent) to generate professional UI code for users.
 */

export const generateNextJSCodeTool = createTool({
  id: 'generate-nextjs-code',
  description: `Generate professional, best-in-class Next.js UI code with inline styles. 
  
  This tool creates complete app.tsx files with:
  - Beautiful, modern design (Stripe/Vercel quality)
  - All styles inline (no external CSS)
  - Proper TypeScript components
  - Rich content and dummy data
  - Single-file applications
  - Multi-page support via state-based routing
  
  Can also:
  - Scrape and recreate websites (provide URL)
  - Generate UI from Contentstack entries (provide content_type_uid and entry_uid)
  - Create custom layouts based on requirements
  
  Use this tool when users need:
  - Frontend code for their Contentstack content
  - Landing pages, portfolios, dashboards, blogs
  - UI mockups or prototypes
  - Professional website code`,
  
  inputSchema: z.object({
    user_request: z.string().describe(`The user's request for what UI to generate. Examples:
      - "Create a landing page for a SaaS product"
      - "Generate UI for my Contentstack entry blog_post/blt123abc"
      - "Recreate the design of https://stripe.com"
      - "Build a portfolio with home, projects, and contact pages"
      - "Create a product showcase page with pricing"`),
    
    additional_context: z.string().optional().describe(`Optional additional context about:
      - Design preferences (modern, minimalist, dark theme, colorful, etc.)
      - Content type (blog, e-commerce, portfolio, corporate, etc.)
      - Target audience
      - Special requirements (forms, animations, specific sections)
      - Contentstack entry details if available`),
    
    resource_id: z.string().optional().describe('Optional resource ID for conversation memory')
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    generated_code: z.string().optional().describe('The complete Next.js app.tsx code'),
    explanation: z.string().optional().describe('Explanation of what was generated'),
    error: z.string().optional()
  }),
  
  execute: async ({ context }) => {
    try {
      // Build the complete request message
      let fullRequest = context.user_request;
      
      if (context.additional_context) {
        fullRequest += `\n\nAdditional context: ${context.additional_context}`;
      }
      
      // Use thread for conversation memory if resource_id provided
      let response;
      if (context.resource_id) {
        const thread = await nextjsCodeAgent.thread({
          resourceid: context.resource_id
        });
        response = await thread.send(fullRequest);
      } else {
        response = await nextjsCodeAgent.generate(fullRequest);
      }
      
      // Extract the code and explanation from the response
      const responseText = response.text;
      
      // Try to extract code block if present
      const codeMatch = responseText.match(/```typescript\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1] : null;
      
      // Create explanation (everything before the code or full response if no code)
      const explanation = codeMatch 
        ? responseText.substring(0, responseText.indexOf('```')).trim()
        : responseText;
      
      return {
        success: true,
        generated_code: extractedCode || responseText,
        explanation: explanation || 'Generated Next.js UI code with professional design and inline styles.'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while generating Next.js code'
      };
    }
  }
});

