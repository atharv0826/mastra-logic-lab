# Frontend API Integration Guide

## Accessing JSON Previews from Mastra Agent API

The onboarding agent now returns structured JSON objects for previews that your frontend can directly access and display.

---

## Preview Tools and Their Responses

### 1. Stack Preview

**Tool Called:** `previewStackTool`

**Response Structure:**
```json
{
  "preview": {
    "stack": {
      "name": "My Website Stack",
      "description": "Content management for my website",
      "master_locale": "en-us"
    }
  },
  "message": "Stack JSON preview generated. Please review and confirm to proceed with creation."
}
```

**Frontend Usage:**
```typescript
// The agent response will include tool results
const agentResponse = await mastraAgent.chat(threadId, message);

// Find the preview tool result
const previewResult = agentResponse.toolResults?.find(
  result => result.toolName === 'preview-stack-json'
);

if (previewResult) {
  const stackPreview = previewResult.result.preview;
  // Display the JSON in your UI
  displayJSON(stackPreview);
}
```

---

### 2. Global Fields Preview

**Tool Called:** `previewGlobalFieldsTool`

**Response Structure:**
```json
{
  "previews": [
    {
      "global_field": {
        "title": "SEO Metadata",
        "uid": "seo_metadata",
        "description": "SEO fields for all pages",
        "schema": [
          {
            "display_name": "Meta Title",
            "uid": "meta_title",
            "data_type": "text",
            "mandatory": true
          },
          {
            "display_name": "Meta Description",
            "uid": "meta_description",
            "data_type": "text",
            "mandatory": false
          }
        ]
      }
    },
    {
      "global_field": {
        "title": "Site Header",
        "uid": "site_header",
        "description": "Header navigation and logo",
        "schema": [...]
      }
    }
  ],
  "count": 2,
  "message": "2 global field(s) ready for creation. Please review and confirm."
}
```

**Frontend Usage:**
```typescript
const previewResult = agentResponse.toolResults?.find(
  result => result.toolName === 'preview-global-fields-json'
);

if (previewResult) {
  const globalFields = previewResult.result.previews;
  const count = previewResult.result.count;
  
  // Render each global field
  globalFields.forEach(({ global_field }) => {
    renderGlobalFieldCard(global_field);
  });
}
```

---

### 3. Content Types Preview

**Tool Called:** `previewContentTypesTool`

**Response Structure:**
```json
{
  "previews": [
    {
      "content_type": {
        "title": "Homepage",
        "uid": "homepage",
        "description": "Homepage content type",
        "schema": [
          {
            "display_name": "Title",
            "uid": "title",
            "data_type": "text",
            "field_metadata": {
              "_default": true
            },
            "mandatory": true,
            "unique": true
          },
          {
            "display_name": "URL",
            "uid": "url",
            "data_type": "text",
            "field_metadata": {
              "_default": true
            }
          },
          {
            "display_name": "Hero Section",
            "uid": "hero_section",
            "data_type": "group",
            "schema": [...]
          }
        ]
      }
    },
    {
      "content_type": {
        "title": "Blog Post",
        "uid": "blog_post",
        "description": "Blog post content type",
        "schema": [...]
      }
    }
  ],
  "count": 2,
  "message": "2 content type(s) ready for creation. Please review and confirm."
}
```

**Frontend Usage:**
```typescript
const previewResult = agentResponse.toolResults?.find(
  result => result.toolName === 'preview-content-types-json'
);

if (previewResult) {
  const contentTypes = previewResult.result.previews;
  const count = previewResult.result.count;
  
  // Render each content type
  contentTypes.forEach(({ content_type }) => {
    renderContentTypeCard(content_type);
  });
}
```

---

## Complete Frontend Flow Example

```typescript
import { MastraAgent } from '@mastra/core';

// Initialize agent
const agent = new MastraAgent({
  // ... agent config
});

// Start conversation
const threadId = 'user-session-123';

// User requests to create a website
let response = await agent.chat(threadId, "Create a corporate website");

// Agent will ask clarifying questions...
response = await agent.chat(threadId, "Homepage, about page, and blog");

// Agent calls previewStackTool - extract the preview
const stackPreview = response.toolResults?.find(
  r => r.toolName === 'preview-stack-json'
)?.result.preview;

// Display preview in UI
if (stackPreview) {
  showStackPreview(stackPreview);
  
  // Wait for user confirmation
  const userConfirms = await getUserConfirmation();
  
  if (userConfirms) {
    // User confirms, send confirmation message
    response = await agent.chat(threadId, "Yes, create it!");
    
    // Agent will create the stack and then generate content model
    // ...
    
    // Later, agent calls preview tools for global fields and content types
    const globalFieldsPreviews = response.toolResults?.find(
      r => r.toolName === 'preview-global-fields-json'
    )?.result.previews;
    
    const contentTypesPreviews = response.toolResults?.find(
      r => r.toolName === 'preview-content-types-json'
    )?.result.previews;
    
    if (globalFieldsPreviews) {
      showGlobalFieldsPreviews(globalFieldsPreviews);
    }
    
    if (contentTypesPreviews) {
      showContentTypesPreviews(contentTypesPreviews);
    }
    
    // Wait for final confirmation
    const finalConfirm = await getUserConfirmation();
    
    if (finalConfirm) {
      response = await agent.chat(threadId, "Yes, create them!");
      // Agent will create all resources automatically
    }
  }
}
```

---

## React Component Example

```tsx
import React, { useState } from 'react';
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface PreviewCardProps {
  preview: any;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  preview,
  title,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="preview-card">
      <h3>{title}</h3>
      
      {/* Display JSON with syntax highlighting */}
      <div className="json-preview">
        <JsonView data={preview} style={darkStyles} />
      </div>
      
      {/* Action buttons */}
      <div className="actions">
        <button onClick={onConfirm} className="btn-primary">
          ✓ Approve & Create
        </button>
        <button onClick={onCancel} className="btn-secondary">
          ✗ Cancel
        </button>
      </div>
    </div>
  );
};

// Usage in your chat interface
export const ChatInterface = () => {
  const [previews, setPreviews] = useState<any[]>([]);
  
  const handleAgentResponse = (response: any) => {
    // Extract preview tool results
    const previewResults = response.toolResults?.filter((r: any) =>
      r.toolName.includes('preview')
    );
    
    if (previewResults?.length) {
      setPreviews(previewResults);
    }
  };
  
  const handleApprove = () => {
    // Send confirmation message to agent
    sendMessage("Yes, proceed with creation");
    setPreviews([]);
  };
  
  return (
    <div className="chat-container">
      {/* Chat messages */}
      <div className="messages">
        {/* ... messages ... */}
      </div>
      
      {/* Preview cards */}
      {previews.map((preview, idx) => (
        <PreviewCard
          key={idx}
          preview={preview.result.preview || preview.result.previews}
          title={preview.result.message}
          onConfirm={handleApprove}
          onCancel={() => setPreviews([])}
        />
      ))}
    </div>
  );
};
```

---

## Benefits of This Approach

1. **Structured Data**: Frontend receives properly typed JSON objects, not strings
2. **Easy Parsing**: No need to parse JSON from text responses
3. **Direct Access**: Access preview data via `toolResults` in agent response
4. **Type Safety**: Can create TypeScript interfaces for the preview structures
5. **Flexible Display**: Use any JSON viewer library or custom component
6. **Separation of Concerns**: Preview data is separate from conversational text

---

## API Response Structure

When you call the Mastra agent API, the response includes:

```typescript
interface AgentResponse {
  text: string;                    // Conversational response
  toolResults?: ToolResult[];      // Tool execution results
  done: boolean;
  // ... other fields
}

interface ToolResult {
  toolName: string;                // e.g., "preview-stack-json"
  result: any;                     // The structured JSON from the tool
  success: boolean;
}
```

Extract preview data from `toolResults` based on `toolName`:
- `preview-stack-json` → Stack preview
- `preview-global-fields-json` → Global fields previews array
- `preview-content-types-json` → Content types previews array

---

## Summary

The preview tools (`previewStackTool`, `previewGlobalFieldsTool`, `previewContentTypesTool`) ensure that:

1. **Agent** calls these tools during conversation
2. **Tools** return structured JSON objects (not text)
3. **API Response** includes these objects in `toolResults`
4. **Frontend** extracts and displays the JSON directly
5. **User** reviews and confirms
6. **Agent** proceeds with actual creation after confirmation

This creates a clean separation between conversational UI and data previews, making it easy for frontends to build rich, interactive preview experiences.

