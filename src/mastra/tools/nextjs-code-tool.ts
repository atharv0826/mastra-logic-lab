import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { nextjsCodeAgent } from '../agents/nextjs-code-agent';
import { sseBus } from '../../server/sse-bus';
import { fetchEntryFromContentstack } from '../../fetchEntryFromContentstack';

/**
 * Next.js Code Generator Tool
 *
 * This tool wraps the Next.js Code Generator Agent, allowing other agents
 * (like the onboarding agent) to generate professional UI code for users.
 */

export const notifyWebsiteBuilderStartTool = createTool({
  id: 'notify-website-builder-start',
  description:
    'Notify the frontend that the Website Builder phase is starting. This performs no operation besides emitting a tool event.',
  inputSchema: z.object({
    reason: z
      .string()
      .optional()
      .describe(
        'Optional context for why the website builder phase is starting',
      ),
  }),
  outputSchema: z.object({
    type: z.literal('phase-event'),
    name: z.literal('website_builder_start'),
    label: z.string(),
  }),
  execute: async ({ context }) => {
    // Emit SSE so the server can push to connected clients
    sseBus.emitWebsiteBuilderStart({
      label: 'Website builder start',
      phase: 'tool_start',
      toolId: 'notify-website-builder-start',
      reason: context?.reason ?? null,
    });

    return {
      type: 'phase-event' as const,
      name: 'website_builder_start' as const,
      label: 'Website builder start',
    };
  },
});

export const generateNextJSCodeTool = createTool({
  id: 'generate-nextjs-code',
  description: `Generate complete Next.js application with Contentstack integration.
  
  Context-aware: Automatically uses entry_uid from recent createEntryTool call if available.
  
  Generates 2 files:
  1. App.tsx - Complete Next.js page with Live Preview, Visual Builder, entry fetching
  2. .env - Environment variables with actual values from context
  
  Features:
  - Fetches entry using Management API (works for all entries including drafts)
  - Includes Contentstack Live Preview SDK integration
  - Adds Visual Builder CSLP tags for editing
  - Generates .env with all required Contentstack configuration
  - Production-ready code with proper TypeScript types
  `,

  inputSchema: z.object({
    user_request: z
      .string()
      .default('Generate a beautiful, modern website')
      .describe('Describe what kind of page or UI you want to generate'),
    api_key: z
      .string()
      .default(process.env.CONTENTSTACK_API_KEY || '')
      .describe('Contentstack API key (from stack creation)'),
    authtoken: z
      .string()
      .default(process.env.CONTENTSTACK_AUTH_TOKEN || '')
      .describe('Contentstack auth token'),
    delivery_token: z
      .string()
      .optional()
      .describe('Delivery token for published content'),
    preview_token: z
      .string()
      .optional()
      .describe('Preview token for draft content'),
    management_token: z
      .string()
      .optional()
      .describe('Management token for content management'),
    environment: z
      .string()
      .default('development')
      .describe('Environment name (e.g., development, production)'),
    content_type_uid: z.string().describe('Content type UID'),
    entry_uid: z
      .string()
      .optional()
      .describe(
        'Entry UID to fetch (auto-detected from context if not provided)',
      ),
    locale: z.string().default('en-us').describe('Locale for the entry'),
    branch: z.string().default('main').describe('Contentstack branch name'),
    region: z
      .enum(['us', 'eu', 'azure-na', 'azure-eu', 'gcp-na'])
      .default('us')
      .describe('Contentstack region'),
    additional_context: z
      .string()
      .optional()
      .describe('Optional design or layout preferences'),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    app_tsx_code: z.string().optional().describe('Complete App.tsx file code'),
    env_file: z.string().optional().describe('.env file with actual values'),
    explanation: z.string().optional(),
    fetched_entry: z.any().optional(),
    entry_uid_used: z.string().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    try {
      const {
        api_key,
        authtoken,
        delivery_token,
        preview_token,
        management_token,
        environment,
        content_type_uid,
        entry_uid,
        locale,
        branch,
        region,
        user_request,
        additional_context,
      } = context;

      if (!entry_uid) {
        throw new Error(
          'entry_uid is required. Please provide the entry UID from the recently created entry.',
        );
      }

      // ===========================================
      // STEP 1: Fetch Contentstack entry
      // ===========================================
      const endpoint = `https://api.contentstack.io/v3/content_types/${content_type_uid}/entries/${entry_uid}?locale=${locale}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          api_key: api_key,
          authtoken: authtoken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch entry: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      const entryData = data.entry;

      if (!entryData) {
        throw new Error('Failed to fetch entry from Contentstack.');
      }

      // ===========================================
      // STEP 2: Generate .env file with actual values
      // ===========================================
      const regionHosts: Record<
        string,
        { cdn: string; app: string; api: string; preview: string }
      > = {
        us: {
          cdn: 'cdn.contentstack.io',
          app: 'app.contentstack.com',
          api: 'api.contentstack.io',
          preview: 'rest-preview.contentstack.com',
        },
        eu: {
          cdn: 'eu-cdn.contentstack.com',
          app: 'https://eu-app.contentstack.com',
          api: 'https://eu-api.contentstack.com',
          preview: 'https://eu-rest-preview.contentstack.com',
        },
        'azure-na': {
          cdn: 'azure-na-cdn.contentstack.com',
          app: 'https://azure-na-app.contentstack.com',
          api: 'https://azure-na-api.contentstack.com',
          preview: 'https://azure-na-rest-preview.contentstack.com',
        },
        'azure-eu': {
          cdn: 'azure-eu-cdn.contentstack.com',
          app: 'https://azure-eu-app.contentstack.com',
          api: 'https://azure-eu-api.contentstack.com',
          preview: 'https://azure-eu-rest-preview.contentstack.com',
        },
        'gcp-na': {
          cdn: 'gcp-na-cdn.contentstack.com',
          app: 'https://gcp-na-app.contentstack.com',
          api: 'https://gcp-na-api.contentstack.com',
          preview: 'https://gcp-na-rest-preview.contentstack.com',
        },
      };

      const hosts = regionHosts[region] || regionHosts.us;

      const envFile = `# Contentstack Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Stack Configuration
CONTENTSTACK_API_KEY=${api_key}
CONTENTSTACK_DELIVERY_TOKEN=${delivery_token || 'your_delivery_token_here'}
CONTENTSTACK_ENVIRONMENT=${environment}
CONTENTSTACK_BRANCH=${branch}
CONTENTSTACK_PREVIEW_TOKEN=${preview_token || 'your_preview_token_here'}
CONTENTSTACK_MANAGEMENT_TOKEN=${management_token || 'your_management_token_here'}

# Hosts
CONTENTSTACK_HOST=${hosts.cdn}
CONTENTSTACK_APP_HOST=${hosts.app}
CONTENTSTACK_API_HOST=${hosts.api}
CONTENTSTACK_PREVIEW_HOST=${hosts.preview}

# Live Preview & Visual Builder
CONTENTSTACK_VISUAL_BUILDER_MODE=builder
CONTENTSTACK_LIVE_PREVIEW=true
CONTENTSTACK_LIVE_EDIT_TAGS=true

# Locale
DEFAULT_LOCALE=${locale}

# Region
CONTENTSTACK_REGION=${region}

# Entry Details (for reference)
# Content Type: ${content_type_uid}
# Entry UID: ${entry_uid}
`;

      // ===========================================
      // STEP 3: Build enhanced prompt for AI
      // ===========================================
      const prompt = `⚠️ CRITICAL: DO NOT USE ANY TOOLS. DO NOT RESEARCH ANYTHING. GENERATE CODE EXACTLY AS THE TEMPLATE BELOW.

You are generating a Next.js page component. Follow the template structure EXACTLY - we are using this in an existing project with templates already set up.

ENTRY DATA TO MAP (use ALL fields from this data):
${JSON.stringify(entryData, null, 2)}

CONTENTSTACK CONFIGURATION:
- Content Type UID: ${content_type_uid}
- Entry UID: ${entry_uid}
- Locale: ${locale}

⚠️ ONLY 2 THINGS TO CHANGE:

1️⃣ REPLACE CONTENT TYPE UID:
   - Find "home_page" in the template (appears 2 times)
   - Replace BOTH occurrences with: "${content_type_uid}"
   - Location 1: In getEntryByUrl() call
   - Location 2: In setDataForChromeExtension()

2️⃣ IMPROVE INLINE STYLES & MAP DATA:
   - Add premium inline styles (gradients, modern design, proper spacing)
   - Map ALL fields from entry data above dynamically
   - Add CSLP tags for every field: {...data?.$?.fieldName}
   - Make it look beautiful and modern (Stripe/Vercel quality)
   - Use only inline styles (no Tailwind, no external CSS)

🚫 DO NOT CHANGE:
- Imports (keep @/types, @/config, @/utils, @/services exactly as is)
- Function names (fetchData, Home)
- Structure (useEffect, useState, etc.)
- File paths or helper functions
- onEntryChange or setDataForChromeExtension logic

🧩 TEMPLATE TO USE (Keep this structure EXACTLY):

\`\`\`typescript
"use client";
import { useEffect, useState } from "react";
import { Page } from "@/types";
import { onEntryChange } from "@/config";
import { setDataForChromeExtension } from "@/utils";
import { getEntryByUrl } from "@/services";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

export default function Home() {
  const [data, setData] = useState<Page.LandingPage["entry"] | null>(null);
  const path = "/";
  const locale = "en-us";

  const fetchData = async () => {
    try {
      const refUids: string[] = [];
      const jsonRTEPaths: string[] = [];

      const res = (await getEntryByUrl<Page.Homepage["entry"]>(
        "home_page", // <-- Replace with "${content_type_uid}"
        locale,
        path,
        refUids,
        jsonRTEPaths
      )) as Page.LandingPage["entry"];

      setData(res);
      setDataForChromeExtension({
        entryUid: res?.uid ?? "",
        contenttype: "home_page", // <-- Replace with "${content_type_uid}"
        locale: locale,
      });

      if (!res) throw "404";
    } catch (err) {
      console.error("Error fetching page data:", err);
    }
  };

 useEffect(() => {
    ContentstackLivePreview.onEntryChange(() => {
      console.log("onEntryChange");
      fetchData();
    });
  }, []);

  return (
    <>
      {data ? (
        <main style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          padding: "40px 20px"
        }}>
          <h1 {...data?.$?.title} style={{
            fontSize: "3rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            {data?.title}
          </h1>
          <p style={{
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.6,
            opacity: 0.85,
            fontSize: "1.1rem"
          }}>
            {data?.description || "Welcome to your new Contentstack-powered site."}
          </p>
          {/* Add more fields dynamically here based on entry data */}
        </main>
      ) : (
        <h1>No data</h1>
      )}
    </>
  );
}
\`\`\`

📝 YOUR TASK:

Step 1: Copy the template above EXACTLY
Step 2: Replace "home_page" with "${content_type_uid}" (2 places only)
Step 3: In the return statement, map ALL entry fields with CSLP tags:
   - <h1 {...data?.$?.title}>{data?.title}</h1>
   - <p {...data?.$?.description}>{data?.description}</p>
   - Continue for ALL fields in the entry data
Step 4: Add beautiful inline styles (gradients, modern spacing, premium design)

⚠️ KEEP EVERYTHING ELSE THE SAME:
✅ Same imports
✅ Same function structure  
✅ Same paths (@/types, @/config, @/utils, @/services)
✅ Same fetchData logic
✅ Same useEffect
✅ Same onEntryChange and setDataForChromeExtension calls

🎨 STYLING REQUIREMENTS:
- Use inline styles only (no Tailwind, no CSS modules)
- Modern gradients (like: linear-gradient(135deg, #0f2027, #203a43, #2c5364))
- Premium typography (fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.02em")
- Proper spacing and responsive design
- Stripe/Vercel/Linear quality

📤 OUTPUT: Return ONLY the complete code (no explanations, no markdown wrappers)
`;

      // ===========================================
      // STEP 4: Generate code using Next.js Agent
      // ===========================================
      const aiResponse = await nextjsCodeAgent.generate(prompt);
      const responseText = aiResponse.text;

      // Extract code block if wrapped in markdown
      let appTsxCode = responseText;
      const codeMatch = responseText.match(
        /```(?:tsx|typescript|jsx|javascript)?\n([\s\S]*?)```/,
      );
      if (codeMatch) {
        appTsxCode = codeMatch[1];
      }

      // ===========================================
      // STEP 5: Return both files
      // ===========================================
      return {
        success: true,
        app_tsx_code: appTsxCode,
        env_file: envFile,
        explanation: `Generated complete Next.js application with Contentstack integration:
        
📄 App.tsx - Premium, production-ready page with:
  ✅ Content Type: ${content_type_uid}
  ✅ Entry UID: ${entry_uid}
  ✅ All fields mapped with CSLP tags {...data?.$?.field}
  ✅ Premium inline styles (gradients, modern design)
  ✅ Live Preview via onEntryChange (@/config)
  ✅ Visual Builder via setDataForChromeExtension (@/utils)
  ✅ Entry fetching via getEntryByUrl (@/services)
  ✅ TypeScript types from @/types
  ✅ Responsive, Stripe/Vercel-quality design
  
📄 .env - Environment configuration with actual values:
  ✅ Stack API key: ${api_key}
  ✅ Environment: ${environment}
  ✅ All Contentstack hosts configured
  ✅ Live Preview enabled
  
Next steps:
1. Copy App.tsx to your Next.js project (app/page.tsx or pages/index.tsx)
2. Copy .env contents to your .env.local file
3. Ensure your project has these template files:
   - @/types (Page type definitions)
   - @/config (onEntryChange function)
   - @/utils (setDataForChromeExtension)
   - @/services (getEntryByUrl function)
4. Run: npm run dev
5. Your premium website is live!`,
        fetched_entry: entryData,
        entry_uid_used: entry_uid,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error while generating code.',
      };
    }
  },
});
