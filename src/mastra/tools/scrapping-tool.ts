import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface ScrapeResponse {
  title: string;
  metadata: {
    description?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogUrl?: string;
    language?: string;
  };
  url: string;
  format: string;
  cleaned: boolean;
  content: string;
}

export const scrapingTool = createTool({
  id: 'scrape-website',
  description: 'Scrape a website and return its content in markdown format. Analyzes website structure to understand page types, sections, and content patterns for Contentstack modeling.',
  inputSchema: z.object({
    url: z.string().describe('The URL of the website to scrape'),
    apiKey: z.string().optional().default(process.env.DUMPLING_API_KEY || '').describe('DumplingAI API key (from DUMPLING_API_KEY env var)'),
    format: z.enum(['markdown', 'html']).optional().default('markdown').describe('Output format'),
    cleaned: z.boolean().optional().default(true).describe('Whether to clean the content'),
    renderJs: z.boolean().optional().default(true).describe('Whether to render JavaScript'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
    metadata: z.object({
      description: z.string().optional(),
      robots: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogUrl: z.string().optional(),
      language: z.string().optional(),
    }),
  }),
  execute: async ({ context }) => {
    return await scrapeWebsite(
      context.url,
      context.apiKey,
      context.format || 'markdown',
      context.cleaned ?? true,
      context.renderJs ?? true
    );
  },
});

const scrapeWebsite = async (
  url: string,
  apiKey: string,
  format: string = 'markdown',
  cleaned: boolean = true,
  renderJs: boolean = true
) => {
  const scrapeUrl = 'https://app.dumplingai.com/api/v1/scrape';

  const dumplingApiKey =  process.env.DUMPLING_API_KEY;


  const response = await fetch(scrapeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${dumplingApiKey}`,
    },
    body: JSON.stringify({
      url: url,
      format: format,
      cleaned: cleaned,
      renderJs: renderJs,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to scrape website: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  const data = (await response.json()) as ScrapeResponse;

  // Validate we have meaningful content
  if (!data.content || data.content.trim().length === 0) {
    throw new Error('Website scraping returned empty content. The website might be blocking scraping or requires authentication.');
  }

  return {
    title: data.title || 'Untitled',
    content: data.content,
    url: data.url,
    metadata: data.metadata || {},
  };
};

