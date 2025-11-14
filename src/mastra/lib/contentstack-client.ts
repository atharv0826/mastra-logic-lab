/**
 * Contentstack CDN API Client
 * 
 * Provides helper functions to fetch entries from Contentstack using the Content Delivery API.
 */

interface FetchEntryParams {
  stackApiKey: string;
  deliveryToken: string;
  environment: string;
  contentTypeUid: string;
  entryUid?: string;
  locale?: string;
  region?: 'us' | 'eu' | 'azure-na' | 'azure-eu' | 'gcp-na';
}

interface ContentstackEntry {
  uid: string;
  title: string;
  [key: string]: any;
}

interface ContentstackResponse {
  entry?: ContentstackEntry;
  entries?: ContentstackEntry[];
}

/**
 * Get the Contentstack CDN API base URL based on region
 */
function getCDNBaseUrl(region: string = 'us'): string {
  const regionUrls: Record<string, string> = {
    'us': 'https://cdn.contentstack.io',
    'eu': 'https://eu-cdn.contentstack.com',
    'azure-na': 'https://azure-na-cdn.contentstack.com',
    'azure-eu': 'https://azure-eu-cdn.contentstack.com',
    'gcp-na': 'https://gcp-na-cdn.contentstack.com',
  };
  
  return regionUrls[region] || regionUrls['us'];
}

/**
 * Fetch a single entry from Contentstack
 */
export async function fetchEntry(params: FetchEntryParams): Promise<ContentstackEntry | null> {
  const {
    stackApiKey,
    deliveryToken,
    environment,
    contentTypeUid,
    entryUid,
    locale = 'en-us',
    region = 'us',
  } = params;

  if (!entryUid) {
    throw new Error('entryUid is required to fetch a single entry');
  }

  const baseUrl = getCDNBaseUrl(region);
  const url = `${baseUrl}/v3/content_types/${contentTypeUid}/entries/${entryUid}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': stackApiKey,
        'access_token': deliveryToken,
        'environment': environment,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Contentstack API error (${response.status}): ${errorText}`);
    }

    const data: ContentstackResponse = await response.json();
    return data.entry || null;
  } catch (error) {
    console.error('Error fetching entry from Contentstack:', error);
    throw error;
  }
}

/**
 * Fetch multiple entries from a content type
 */
export async function fetchEntries(params: Omit<FetchEntryParams, 'entryUid'>): Promise<ContentstackEntry[]> {
  const {
    stackApiKey,
    deliveryToken,
    environment,
    contentTypeUid,
    locale = 'en-us',
    region = 'us',
  } = params;

  const baseUrl = getCDNBaseUrl(region);
  const url = `${baseUrl}/v3/content_types/${contentTypeUid}/entries`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': stackApiKey,
        'access_token': deliveryToken,
        'environment': environment,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Contentstack API error (${response.status}): ${errorText}`);
    }

    const data: ContentstackResponse = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Error fetching entries from Contentstack:', error);
    throw error;
  }
}

/**
 * Fetch entry with references populated
 */
export async function fetchEntryWithReferences(params: FetchEntryParams): Promise<ContentstackEntry | null> {
  const {
    stackApiKey,
    deliveryToken,
    environment,
    contentTypeUid,
    entryUid,
    locale = 'en-us',
    region = 'us',
  } = params;

  if (!entryUid) {
    throw new Error('entryUid is required to fetch a single entry');
  }

  const baseUrl = getCDNBaseUrl(region);
  const url = `${baseUrl}/v3/content_types/${contentTypeUid}/entries/${entryUid}?include_reference=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': stackApiKey,
        'access_token': deliveryToken,
        'environment': environment,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Contentstack API error (${response.status}): ${errorText}`);
    }

    const data: ContentstackResponse = await response.json();
    return data.entry || null;
  } catch (error) {
    console.error('Error fetching entry with references from Contentstack:', error);
    throw error;
  }
}

/**
 * Helper to get Contentstack credentials from environment variables
 */
export function getContentstackCredentials() {
  return {
    stackApiKey: process.env.CONTENTSTACK_API_KEY || '',
    deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN || '',
    environment: process.env.CONTENTSTACK_ENVIRONMENT || 'production',
    region: (process.env.CONTENTSTACK_REGION || 'us') as 'us' | 'eu' | 'azure-na' | 'azure-eu' | 'gcp-na',
  };
}

