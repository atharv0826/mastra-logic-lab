# Environment Configuration

This document describes all environment variables needed for the Mastra Logic Lab system.

## Required Environment Variables

### OpenAI API (for AI Agents)

```bash
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

### Contentstack API Credentials

```bash
# Management API - Required for stack, content type, and entry creation
CONTENTSTACK_AUTH_TOKEN=your_contentstack_auth_token
CONTENTSTACK_ORG_ID=your_organization_id
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token

# Delivery API - Required for fetching content
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=production
CONTENTSTACK_REGION=us
```

### DumplingAI (for Website Scraping)

```bash
DUMPLING_API_KEY=your_dumplingai_api_key
```

## Optional Environment Variables

### Contentstack MCP Configuration

```bash
# Brand Kit integration
CONTENTSTACK_BRAND_KIT_ID=

# Launch project integration
CONTENTSTACK_LAUNCH_PROJECT_ID=

# Personalize project integration  
CONTENTSTACK_PERSONALIZE_PROJECT_ID=

# Content Delivery API groups
CONTENTSTACK_GROUPS=cda

# Lytics integration
LYTICS_ACCESS_TOKEN=
```

### Mastra MCP Configuration

```bash
MASTRA_API_KEY=
MASTRA_ENVIRONMENT=production
```

### Mastra Cloud (optional)

```bash
MASTRA_CLOUD_ACCESS_TOKEN=
```

## How to Get Credentials

### Contentstack Credentials

1. **Auth Token & Management Token**:
   - Log in to [Contentstack](https://app.contentstack.com)
   - Go to Settings > Tokens
   - Create a Management Token
   - Save both the token and your Organization UID

2. **API Key & Delivery Token**:
   - After creating a stack, go to Settings > Tokens
   - Create a Delivery Token
   - The API Key is shown in Settings > Stack

3. **Region**:
   - Default: `us`
   - Options: `us`, `eu`, `azure-na`, `azure-eu`

### OpenAI API Key

1. Sign up at [OpenAI](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new API key

### Google Generative AI Key

1. Sign up at [Google AI Studio](https://makersuite.google.com/)
2. Create an API key

### DumplingAI API Key

1. Sign up at [DumplingAI](https://dumplingai.com)
2. Get your API key from the dashboard

## Setup Instructions

1. Copy the environment variables template:

```bash
# Create a .env file in the project root
touch .env
```

2. Add all required variables to `.env`:

```bash
# Example .env file
OPENAI_API_KEY=sk-...
CONTENTSTACK_AUTH_TOKEN=blt...
CONTENTSTACK_ORG_ID=blt...
CONTENTSTACK_API_KEY=blt...
CONTENTSTACK_DELIVERY_TOKEN=cs...
CONTENTSTACK_ENVIRONMENT=production
CONTENTSTACK_REGION=us
DUMPLING_API_KEY=...
```

3. Verify configuration:

```bash
npm run dev
```

## MCP Integration

The system now integrates with two MCP (Model Context Protocol) servers:

### 1. Contentstack MCP

Provides tools for:
- Fetching content from Contentstack
- Querying entries dynamically
- Getting content type schemas
- Live preview integration

Environment variables used:
- `CONTENTSTACK_API_KEY`
- `CONTENTSTACK_DELIVERY_TOKEN`
- `CONTENTSTACK_ENVIRONMENT`
- `CONTENTSTACK_REGION`

### 2. Mastra MCP

Provides tools for:
- Workflow management
- Agent orchestration
- Tool execution

Environment variables used:
- `MASTRA_API_KEY`
- `MASTRA_ENVIRONMENT`

## Agents with MCP Access

The following agents have access to MCP tools:

1. **Onboarding Agent** - Can use both Contentstack and Mastra MCP tools
2. **Website Builder Agent** - Can use both Contentstack and Mastra MCP tools
3. **Content Modeling Agent** - Can use both Contentstack and Mastra MCP tools

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use different tokens** for development and production
3. **Rotate tokens** periodically
4. **Limit token permissions** to minimum required
5. **Use environment-specific** credentials

## Troubleshooting

### MCP Connection Issues

If you see errors about MCP connection:

1. Verify environment variables are set correctly
2. Check that `npx` is available in your PATH
3. Ensure `@contentstack/mcp` package is accessible
4. Check network connectivity

### Missing Credentials

If you see "credentials required" errors:

1. Verify all required environment variables are set
2. Check that tokens are not expired
3. Verify organization_uid matches your Contentstack account
4. Ensure API key belongs to the correct stack

### MCP Tools Not Available

If MCP tools don't appear in agents:

1. Check that MCP is configured in `src/mastra/index.ts`
2. Verify agents have `mcp: ['contentstackMCP', 'mastraMCP']` in their configuration
3. Restart the development server
4. Check logs for MCP initialization errors

## Complete Example .env

```bash
# AI Models
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GOOGLE_GENERATIVE_AI_API_KEY=AIza-xxxxxxxxxxxxx

# Contentstack
CONTENTSTACK_AUTH_TOKEN=blt1234567890abcdef
CONTENTSTACK_ORG_ID=blt0987654321fedcba
CONTENTSTACK_API_KEY=blt9199a66fe69452d3
CONTENTSTACK_MANAGEMENT_TOKEN=blt5678901234567890
CONTENTSTACK_DELIVERY_TOKEN=csa6e0d43e3ce7ea44069aa0fa
CONTENTSTACK_ENVIRONMENT=production
CONTENTSTACK_REGION=us

# Website Scraping
DUMPLING_API_KEY=da_xxxxxxxxxxxxx

# Optional: Contentstack MCP Advanced Features
CONTENTSTACK_BRAND_KIT_ID=
CONTENTSTACK_LAUNCH_PROJECT_ID=
CONTENTSTACK_PERSONALIZE_PROJECT_ID=
CONTENTSTACK_GROUPS=cda
LYTICS_ACCESS_TOKEN=

# Optional: Mastra MCP
MASTRA_API_KEY=
MASTRA_ENVIRONMENT=production

# Optional: Mastra Cloud
MASTRA_CLOUD_ACCESS_TOKEN=
```

