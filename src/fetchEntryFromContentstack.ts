export async function fetchEntryFromContentstack({
  apiKey,
  token,
  environment,
  contentTypeUid,
  entryUid,
  usePreview,
}: {
  apiKey: string;
  token?: string;
  environment: string;
  contentTypeUid: string;
  entryUid: string;
  usePreview?: boolean;
}) {
  const baseURL = usePreview
    ? 'https://rest-preview.contentstack.com/v3'
    : 'https://cdn.contentstack.io/v3';

  const res = await fetch(
    `${baseURL}/content_types/${contentTypeUid}/entries/${entryUid}?environment=${environment}`,
    {
      headers: {
        api_key: apiKey,
        access_token: token || '',
      },
    },
  );

  if (!res.ok) {
    console.error('Failed to fetch entry:', await res.text());
    return null;
  }

  const data = await res.json();
  return data.entry;
}
