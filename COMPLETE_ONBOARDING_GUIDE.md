# Complete Contentstack Onboarding Guide

This guide explains the enhanced Contentstack onboarding system that creates a complete project from start to finish.

## What Gets Created

When you say "create a project" to the onboarding agent, it will automatically create:

1. **Contentstack Stack** - A new stack in your Contentstack organization
2. **Content Types** - Data models based on your requirements
3. **Global Fields** - Reusable field groups (if needed)
4. **Sample Entries** - Initial content for each content type
5. **CRA Application** - A complete Create React App with TypeScript

## The Complete Flow

```
User Request
    ↓
Stack Creation
    ↓
Content Type & Global Field Creation
    ↓
Sample Entry Creation
    ↓
CRA Application Generation
    ↓
Ready to Use!
```

## Using the Onboarding Agent (Recommended)

### Example Conversation

```typescript
import { mastra } from './src/mastra';

const agent = mastra.agents.onboardingAgent;

// Start the conversation
const response = await agent.generate([
  {
    role: 'user',
    content: 'I want to create a shoes e-commerce website'
  }
]);
```

The agent will:
1. Ask clarifying questions about your project
2. Show JSON preview of the stack to be created
3. Wait for your confirmation
4. Create the stack
5. Generate and show content model preview
6. Wait for your confirmation
7. Create content types and global fields
8. **Automatically create sample entries** for all content types
9. **Automatically generate a complete CRA application**
10. Provide setup instructions

## Using the Workflow Directly

For when you have all information upfront:

```typescript
import { mastra } from './src/mastra';

const workflow = mastra.workflows.onboardingWorkflow;

const result = await workflow.execute({
  triggerData: {
    user_requirements: 'E-commerce shoes website',
    stack_name: 'Shoes Store',
    stack_description: 'Online shoes e-commerce platform',
    authtoken: process.env.CONTENTSTACK_AUTH_TOKEN,
    organization_uid: process.env.CONTENTSTACK_ORG_ID,
    master_locale: 'en-us',
    content_model: {
      content_types: [
        {
          title: 'Shoes Home Page',
          uid: 'shoes_home_page',
          description: 'Homepage for shoes store',
          schema: [
            // ... schema fields
          ]
        }
      ]
    }
  }
});
```

### Workflow Output

The workflow returns a comprehensive summary:

```typescript
{
  success: true,
  message: "Contentstack onboarding completed successfully!",
  stack: {
    name: "Shoes Store",
    uid: "blt123abc",
    api_key: "blt456def"
  },
  global_fields: [
    // Array of created global fields
  ],
  content_types: [
    // Array of created content types
  ],
  entries: [
    // Array of created sample entries
  ],
  website: {
    files: [
      { path: "package.json", content: "..." },
      { path: "src/App.tsx", content: "..." },
      { path: "src/contentstack.ts", content: "..." },
      // ... all generated files
    ],
    instructions: "Setup instructions..."
  },
  statistics: {
    global_fields_created: 2,
    content_types_created: 3,
    entries_created: 3,
    website_files_generated: 10,
    total_items: 8
  }
}
```

## Generated CRA Application Features

The automatically generated application includes:

### Files Generated

1. **package.json** - Dependencies and scripts
2. **tsconfig.json** - TypeScript configuration
3. **.env** - Environment variables (pre-configured with your API key)
4. **src/contentstack.ts** - Contentstack SDK setup with Live Preview
5. **src/App.tsx** - Main application component
6. **src/App.css** - Beautiful, modern styling with gradients
7. **src/index.tsx** - React entry point
8. **public/index.html** - HTML template
9. **README.md** - Setup and usage documentation

### Application Features

- ✅ **React 18** with TypeScript
- ✅ **Contentstack SDK** integration
- ✅ **Live Preview** support for real-time content editing
- ✅ **Responsive Design** - works on mobile, tablet, and desktop
- ✅ **Modern UI** - Beautiful gradients and animations
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Data-CSLP Attributes** - For live editing in Contentstack

### Running the Generated Application

```bash
# 1. Navigate to your project directory
cd shoes-store

# 2. Copy all generated files to the directory

# 3. Install dependencies
npm install

# 4. Update .env with your delivery token
# Get this from Contentstack: Settings > Tokens

# 5. Start the development server
npm start

# 6. Open http://localhost:3000
```

## Sample Entry Creation

The system automatically creates sample entries for each content type:

- **Text fields**: Populated with descriptive sample text
- **Number fields**: Set to 99.99
- **Date fields**: Set to current date
- **File fields**: Set to null (you can upload later)
- **Rich text**: Populated with sample HTML content

You can edit these entries in Contentstack and see changes in real-time with Live Preview!

## Tools Used Internally

The workflow uses these tools behind the scenes:

1. `generateContentModelTool` - Generate content model using AI
2. `createStackTool` - Create Contentstack stack
3. `createGlobalFieldTool` - Create reusable global fields
4. `createContentTypeTool` - Create content types
5. `generateSampleEntriesTool` - **NEW**: Generate sample entry data
6. `createEntryTool` - Create entries in Contentstack
7. `generateWebsiteCodeTool` - **NEW**: Generate complete CRA application

## Example Use Cases

### 1. E-commerce Store

```typescript
const response = await agent.generate([{
  role: 'user',
  content: 'Create an e-commerce store for selling shoes with product listings, categories, and a shopping cart'
}]);
```

**Result**: Stack + Content Types (Product, Category, Cart) + Sample Entries + Beautiful storefront app

### 2. Blog Platform

```typescript
const response = await agent.generate([{
  role: 'user',
  content: 'Create a blog platform with posts, authors, categories, and comments'
}]);
```

**Result**: Stack + Content Types (Post, Author, Category, Comment) + Sample Entries + Modern blog app

### 3. Portfolio Website

```typescript
const response = await agent.generate([{
  role: 'user',
  content: 'Create a portfolio website with projects, skills, and contact information'
}]);
```

**Result**: Stack + Content Types (Project, Skill) + Sample Entries + Professional portfolio app

## Configuration

### Environment Variables Required

```bash
# Required for stack creation
CONTENTSTACK_AUTH_TOKEN=your_auth_token
CONTENTSTACK_ORG_ID=your_org_id

# Required for the generated app to fetch content
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
```

### Getting Credentials

1. **Auth Token & Org ID**: 
   - Log in to Contentstack
   - Go to Settings > Tokens
   - Create a Management Token

2. **Delivery Token**:
   - Go to Settings > Tokens
   - Create a Delivery Token
   - Add this to the generated app's `.env` file

## Customization

After generation, you can customize:

1. **Styling** - Edit `src/App.css` for custom styles
2. **Components** - Create new components in `src/components/`
3. **Content Types** - Add more fields in Contentstack
4. **Entries** - Edit the sample entries or create new ones
5. **Pages** - Add routing with React Router

## Workflow Steps Breakdown

### Step 1: Validate Inputs
- Checks that stack name, description, and credentials are provided
- Validates content model structure

### Step 2: Create Stack
- Creates a new stack in Contentstack
- Returns API key and stack UID

### Step 3: Create Global Fields
- Creates reusable field groups (if any defined)
- Must be created before content types that reference them

### Step 4: Create Content Types
- Creates all content type definitions
- Includes references to global fields

### Step 5: Create Sample Entries ⭐ **NEW**
- Generates sample data for each content type
- Creates one entry per content type
- Populates fields with appropriate sample values

### Step 6: Generate Website ⭐ **NEW**
- Generates complete CRA application
- Includes all configuration files
- Sets up Contentstack SDK integration
- Adds Live Preview support

### Step 7: Generate Summary
- Compiles statistics
- Returns all created resources
- Provides setup instructions

## Benefits

### For Developers

- ⚡ **Fast Setup** - Complete project in minutes, not hours
- 🎯 **Best Practices** - Generated code follows React and TypeScript best practices
- 🔄 **Live Preview** - Real-time content editing
- 📦 **Everything Included** - No manual configuration needed

### For Content Editors

- ✍️ **Sample Content** - Pre-populated entries to start with
- 👁️ **Visual Editing** - Live Preview shows changes instantly
- 🎨 **Beautiful UI** - Professional design out of the box
- 📱 **Responsive** - Works on all devices

## Troubleshooting

### Workflow Fails at Entry Creation

**Issue**: Sample entries can't be created

**Solution**: 
- Ensure your auth token has permission to create entries
- Check that content types were created successfully
- Verify the stack API key is valid

### Generated App Can't Fetch Content

**Issue**: App shows "No entries found" error

**Solution**:
- Add delivery token to `.env` file
- Publish the sample entries in Contentstack
- Check API key and environment name are correct

### Live Preview Not Working

**Issue**: Changes in Contentstack don't appear in real-time

**Solution**:
- Ensure you're running the app with `npm start`
- Check that Live Preview is enabled in Contentstack
- Verify data-cslp attributes are present in the generated code

## Running Examples

```bash
# Example 1: Conversational onboarding
npm run example 1

# Example 2: Direct workflow execution (includes entry creation and website generation)
npm run example 2

# Example 3: Manual tool usage
npm run example 3

# Example 4: E-commerce schema generation
npm run example 4
```

## Next Steps

After your project is created:

1. ✅ Review and edit the generated code
2. ✅ Customize the styling in `App.css`
3. ✅ Edit sample entries in Contentstack
4. ✅ Add more content types if needed
5. ✅ Deploy your app (Vercel, Netlify, etc.)

## Summary

The enhanced onboarding workflow creates a **complete, production-ready project** that includes:

- Contentstack configuration
- Content models
- Sample content
- Beautiful React application
- Live Preview support
- Full TypeScript support
- Modern, responsive design

All in one automated flow! 🚀

