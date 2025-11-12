# Contentstack Entry UI Generation

## Overview

The Next.js Code Generator Agent now includes powerful integration with **Contentstack CMS** to automatically generate professional, best-in-class UI based on your actual content entries.

## 🌟 Key Feature: `getEntryAndGenerateUITool`

This tool fetches existing Contentstack entries and analyzes their structure to create stunning, production-ready Next.js UI that's specifically tailored to your content.

### What It Does

1. **Fetches Entry Data** - Retrieves actual content from Contentstack
2. **Analyzes Schema** - Understands field types and content structure
3. **Provides Recommendations** - Suggests optimal UI components for each field
4. **Generates Beautiful UI** - Creates best-in-class Next.js code with:
   - REAL content from your entry (not placeholders)
   - Professional inline styles
   - Proper component organization
   - Type-safe TypeScript interfaces
   - Modern, premium design

## 🚀 How to Use

### Basic Usage

```typescript
const agent = mastra.getAgent('nextjsCodeAgent');

// Simple request with entry details
const response = await agent.generate(
  'Create UI for my Contentstack entry: blog_post/blt123abc456'
);

console.log(response.text); // Complete Next.js app.tsx code
```

### Conversational Usage

```typescript
// Start a thread for context-aware conversation
const thread = await agent.thread({ resourceid: 'user-123' });

// Initial request
const initial = await thread.send(
  'Generate UI for Contentstack entry: homepage/blt789xyz'
);

// Refine the design
const refined = await thread.send(
  'Make it darker theme with more emphasis on images'
);

// Add more features
const final = await thread.send(
  'Add a newsletter signup section at the bottom'
);
```

## 📝 Request Formats

You can request UI generation in various ways:

```
"Create UI for my Contentstack entry: blog_post/blt123abc456"
"Generate page for entry with content_type_uid: homepage and entry_uid: blt789xyz"
"Show me UI for all my product entries"
"Build a beautiful page from my blog post entry blt123abc"
```

## 🎯 What the Agent Does

### Step 1: Fetch Entry
The agent calls `getEntryAndGenerateUITool` which:
- Connects to Contentstack API
- Fetches the entry data
- Retrieves all field values

### Step 2: Analyze Schema
The tool analyzes the entry to identify:
- Field names and types
- Content availability
- Data relationships
- UI component mapping

### Step 3: Generate Recommendations
Based on field names and types:

| Field Pattern | UI Recommendation |
|--------------|-------------------|
| `title`, `heading` | Large hero heading with typography |
| `description`, `content`, `body` | Well-formatted content sections |
| `image`, `photo`, `banner` | Featured images with proper layout |
| Arrays | Card grids or lists |
| `cta`, `button` | Prominent call-to-action buttons |
| `author`, `creator` | Byline sections |
| `date`, `published` | Formatted timestamps |
| `tags`, `categories` | Styled badge components |

### Step 4: Create Beautiful UI
The agent generates:
- Complete `app.tsx` file
- TypeScript interfaces for data
- Proper React components
- Rich inline styles (gradients, shadows, animations)
- Real content from the entry
- Professional, modern design

## 🎨 Example Output

For a blog post entry, the agent might generate:

```typescript
'use client';

import { useState } from 'react';

interface BlogPost {
  title: string;
  content: string;
  author: string;
  published_date: string;
  featured_image: string;
  tags: string[];
}

export default function App() {
  // ACTUAL DATA from Contentstack entry
  const post: BlogPost = {
    title: "10 Ways to Improve Your React Performance",
    content: "React is a powerful library for building... [full content from entry]",
    author: "Jane Developer",
    published_date: "2024-01-15",
    featured_image: "https://images.contentstack.io/...",
    tags: ["React", "Performance", "Web Development"]
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, sans-serif',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 20px',
      textAlign: 'center' as const,
      color: '#fff',
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    meta: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      fontSize: '14px',
      opacity: 0.9,
    },
    featuredImage: {
      width: '100%',
      maxWidth: '1200px',
      height: 'auto',
      margin: '0 auto',
      display: 'block',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    },
    content: {
      maxWidth: '800px',
      margin: '60px auto',
      padding: '0 20px',
      fontSize: '18px',
      lineHeight: '1.8',
      color: '#333',
    },
    tagsContainer: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      padding: '40px 20px',
      flexWrap: 'wrap' as const,
    },
    tag: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>{post.title}</h1>
        <div style={styles.meta}>
          <span>By {post.author}</span>
          <span>•</span>
          <span>{new Date(post.published_date).toLocaleDateString()}</span>
        </div>
      </header>

      <img 
        src={post.featured_image} 
        alt={post.title}
        style={styles.featuredImage}
      />

      <article style={styles.content}>
        <p>{post.content}</p>
      </article>

      <div style={styles.tagsContainer}>
        {post.tags.map((tag, index) => (
          <span key={index} style={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
```

## 🏆 Key Benefits

### 1. **Real Content**
- No generic placeholders
- Actual data from your Contentstack entries
- Content-specific UI tailored to your schema

### 2. **Best-in-Class Design**
- Modern, professional styling
- Premium visual quality (Stripe/Vercel/Linear level)
- Rich design elements (gradients, shadows, animations)
- NOT bland or boring

### 3. **Intelligent Mapping**
- Automatically understands your content structure
- Maps fields to appropriate UI components
- Organizes content logically

### 4. **Production-Ready Code**
- Clean, maintainable TypeScript
- Proper component structure
- All styles inline (no external files needed)
- Ready to copy and use

### 5. **Conversational Refinement**
- Iterative improvements
- Memory-based context
- Easy modifications

## 🔧 Configuration

### Required Environment Variables

```bash
# Contentstack API Credentials (Management API)
CONTENTSTACK_API_KEY=your_stack_api_key
CONTENTSTACK_AUTH_TOKEN=your_auth_token

# OpenAI for Agent
OPENAI_API_KEY=your_openai_key
```

**Note:** This tool uses the Contentstack **Management API** (not Delivery API), which means:
- Uses `authtoken` instead of `delivery_token`
- Can fetch draft/unpublished entries
- Same credentials as used for creating content
- No need for separate delivery token configuration

### Optional Parameters

When making requests, you can specify:
- `content_type_uid` (required): The content type identifier
- `entry_uid` (optional): Specific entry ID (omit to fetch all entries)
- `locale` (default: 'en-us'): Which locale to fetch

**Benefits of using Management API:**
- ✅ Can access draft/unpublished entries
- ✅ Same authtoken used throughout the system
- ✅ No need to configure delivery tokens
- ✅ Can preview entries before publishing
- ✅ Works seamlessly with the onboarding workflow

## 📊 Content Type Examples

### Blog Post
```
"Create UI for content_type: blog_post, entry: blt123abc"
```
**Generates:** Article layout with header, featured image, content, author byline, tags

### Homepage
```
"Generate homepage from entry: homepage/blt456def"
```
**Generates:** Hero section, features grid, CTAs, footer

### Product
```
"Show UI for all product entries"
```
**Generates:** Product grid with cards, images, prices, descriptions

### Landing Page
```
"Build landing page from entry: landing_page/blt789xyz"
```
**Generates:** Hero, features, testimonials, pricing, footer

## 🎯 Use Cases

### 1. **Content Preview**
Generate beautiful preview pages for your Contentstack entries before publishing

### 2. **Rapid Prototyping**
Quickly create UI mockups based on actual content structure

### 3. **Frontend Development**
Get a head start on frontend development with generated React code

### 4. **Design System Creation**
Generate consistent UI patterns across different content types

### 5. **Client Presentations**
Show clients how their content will look with professional design

## 💡 Tips for Best Results

### 1. **Be Specific**
```
✅ "Create UI for blog_post entry blt123abc"
❌ "Create something"
```

### 2. **Provide Entry IDs**
```
✅ "Generate UI for entry homepage/blt456def"
✅ "Show all product entries as a grid"
```

### 3. **Request Refinements**
```typescript
// Initial generation
await thread.send('Create UI for entry blog_post/blt123');

// Refine the design
await thread.send('Make it darker theme');
await thread.send('Add a related posts section');
await thread.send('Make the images bigger');
```

### 4. **Specify Design Preferences**
```
"Create a minimalist UI for entry blog_post/blt123"
"Generate a dark-themed page for homepage/blt456"
"Show a colorful, playful UI for kids_content/blt789"
```

## 🔄 Complete Workflow Example

```typescript
import { mastra } from './src/mastra';

async function generateBlogUI() {
  const agent = mastra.getAgent('nextjsCodeAgent');
  const thread = await agent.thread({ resourceid: 'blog-project-1' });

  // Step 1: Generate initial UI
  const step1 = await thread.send(
    'Create a beautiful blog post UI for my Contentstack entry blog_post/blt123abc456'
  );
  
  console.log('Generated code:', step1.text);
  
  // Step 2: Request dark theme
  const step2 = await thread.send(
    'Make it a dark theme with purple accents'
  );
  
  // Step 3: Add features
  const step3 = await thread.send(
    'Add a related posts section at the bottom with 3 card slots'
  );
  
  // Step 4: Refine styling
  const step4 = await thread.send(
    'Make the featured image full-width and add a subtle gradient overlay'
  );
  
  // Final code is now in step4.text
  return step4.text;
}
```

## 🚨 Troubleshooting

### "Failed to fetch entry"
- Check your CONTENTSTACK_API_KEY
- Check your CONTENTSTACK_DELIVERY_TOKEN
- Verify the content_type_uid and entry_uid are correct
- Ensure the environment name is correct

### "No entries found"
- Verify the entry exists in Contentstack
- Check that the entry is published
- Confirm the locale is correct

### "Entry fetched but generic UI"
- Make sure to explicitly request using Contentstack entry
- Mention the content_type_uid and entry_uid in your request
- The agent should automatically call getEntryAndGenerateUITool

## 📚 Related Documentation

- [Next.js Code Generator Guide](./NEXTJS_CODE_AGENT_GUIDE.md)
- [Contentstack Onboarding](./CONTENTSTACK_ONBOARDING.md)
- [Usage Examples](./examples/contentstack-ui-generation-example.ts)

## 🎉 Summary

The Contentstack Entry UI Generation feature allows you to:

✅ Fetch real content from Contentstack  
✅ Automatically generate professional UI  
✅ Get best-in-class, modern designs  
✅ Use actual entry data (not placeholders)  
✅ Create production-ready React code  
✅ Refine iteratively through conversation  
✅ Save massive development time  

**Transform your Contentstack entries into beautiful, professional UIs instantly!** 🚀

