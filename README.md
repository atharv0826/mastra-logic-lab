# Mastra Logic Lab - Contentstack Onboarding System

An intelligent, AI-powered onboarding system for Contentstack CMS that streamlines the customer onboarding process and provides a seamless digital experience.

## 🌟 Features

- **Conversational AI Onboarding**: Natural language interaction to understand customer requirements
- **Intelligent Content Modeling**: AI-powered generation of production-ready content types and global fields
- **Automated Stack Creation**: Programmatic setup of Contentstack environments
- **Smart Decision Making**: Automatically determines when to use reusable components (global fields)
- **Multi-Agent Architecture**: Specialized agents for different aspects of onboarding
- **Complete Workflow Orchestration**: End-to-end automation from requirements to deployment

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.9.0
- Contentstack account with API access
- OpenAI API key (for AI agents)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your credentials
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# OpenAI (for AI agents)
OPENAI_API_KEY=your_openai_api_key

# Contentstack API credentials
CONTENTSTACK_AUTH_TOKEN=your_contentstack_auth_token
CONTENTSTACK_ORG_ID=your_organization_id
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token
```

### Running the System

```bash
# Start Mastra development server
npm run dev

# Access the Mastra playground
# Open http://localhost:4111 in your browser
```

## 📖 Usage

### Option 1: Mastra Playground (Recommended for Testing)

1. Start the dev server: `npm run dev`
2. Open http://localhost:4111
3. Select "Contentstack Onboarding Agent"
4. Start chatting: "I want to create a website for my company"
5. Follow the agent's guidance through the onboarding process

### Option 2: Example Scripts

```bash
# Run conversational example
npm run example 1

# Run workflow example
npm run example 2

# Run manual tool usage example
npm run example 3

# Run e-commerce schema generation
npm run example 4
```

### Option 3: Programmatic Usage

```typescript
import { mastra } from './src/mastra';

// Use the onboarding agent
const agent = mastra.agents.onboardingAgent;

const response = await agent.generate([
  {
    role: 'user',
    content: 'I want to create a blog website'
  }
]);

console.log(response.text);
```

## 🏗️ System Architecture

### Agents

1. **Onboarding Agent** (`onboardingAgent`)
   - Main conversational interface
   - Gathers requirements and guides users
   - Orchestrates the onboarding process

2. **Content Modeling Agent** (`contentModelingAgent`)
   - Generates Contentstack schemas
   - Applies best practices automatically
   - Decides on global field usage

### Tools

- `createStackTool` - Creates Contentstack stacks
- `createGlobalFieldTool` - Creates reusable global fields
- `createContentTypeTool` - Creates content types
- `gatherRequirementsTool` - Structures user requirements

### Workflows

- `onboardingWorkflow` - Complete end-to-end onboarding process

## 📋 Example Conversations

### Simple Blog

```
You: I want to create a blog

Agent: Great! I'd be happy to help you set up a Contentstack blog. 
       To get started, could you tell me a bit more about your blog?
       - What topics will you write about?
       - Will you have multiple authors?
       - Do you need categories or tags?

You: It's a personal tech blog. Just me as the author. I'd like categories.

Agent: Perfect! I'll set up:
       1. A stack for your blog
       2. SEO Metadata global field (for reuse across posts)
       3. Blog Post content type (with categories)
       4. Category content type
       
       For the stack:
       - Name: Tech Blog
       - Description: Personal tech blog with categories
       
       Does this sound good? And could you provide your Contentstack credentials?

You: Yes, that's perfect. My authtoken is xxx and organization_uid is yyy

Agent: Excellent! Creating your blog stack now...
       [Creates stack, global fields, and content types]
       
       Success! Your blog is ready:
       - Stack: Tech Blog (blt123...)
       - Created: SEO Metadata (global field)
       - Created: Blog Post (content type)
       - Created: Category (content type)
       
       You can now start creating content in Contentstack!
```

### E-commerce Website

```
You: I need an e-commerce site

Agent: Great! I can help you set up an e-commerce site in Contentstack.
       Could you tell me more about:
       - What products will you sell?
       - Do you need product variants (sizes, colors)?
       - Will you have a blog or content pages?
       - Do you need customer reviews?

You: Clothing store. Yes to variants. No blog. Yes to reviews.

Agent: Perfect! I'll create:
       1. Global fields: Header, Footer, SEO
       2. Content types:
          - Product (with variants, images, price)
          - Product Category
          - Product Review
          - Home Page
          
       Ready to proceed?
```

## 📚 Documentation

- [Complete System Documentation](./CONTENTSTACK_ONBOARDING.md)
- [Example Scripts](./examples/onboarding-example.ts)
- [Content Modeling Constants](./src/constants/content-modelling.ts)

## 🎯 Use Cases

### For Contentstack Customers

- **Quick Setup**: Get from zero to content model in minutes
- **Best Practices**: Automatically enforced conventions
- **No CMS Expertise Needed**: AI guides you through the process
- **Intelligent Defaults**: Smart decisions on global fields and structure

### For Contentstack Teams

- **Accelerated Onboarding**: Reduce onboarding time from hours to minutes
- **Consistent Quality**: Every setup follows best practices
- **Scalable**: Handle multiple customer onboardings simultaneously
- **Customizable**: Easy to extend for specific customer needs

## 🔧 Customization

### Adding Custom Content Models

Edit `src/constants/content-modelling.ts` to add new field types or templates.

### Modifying Agent Behavior

Agents can be customized by editing their instructions:

```typescript
// src/mastra/agents/onboarding-agent.ts
export const onboardingAgent = new Agent({
  name: 'Contentstack Onboarding Agent',
  instructions: `
    // Customize instructions here
  `,
  model: 'openai/gpt-4o', // Change model if needed
  // ...
});
```

### Adding New Tools

Create tools in `src/mastra/tools/` and register them:

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const myCustomTool = createTool({
  id: 'my-custom-tool',
  description: 'Does something useful',
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ context }) => {
    // Tool logic here
    return { output: context.input };
  },
});
```

## 🧪 Testing

The system includes several example scenarios for testing:

```bash
# Test conversational flow
npm run example 1

# Test full workflow
npm run example 2

# Test individual tools
npm run example 3
```

## 📊 Project Structure

```
mastra-logic-lab/
├── src/
│   ├── mastra/
│   │   ├── agents/
│   │   │   ├── onboarding-agent.ts          # Main conversational agent
│   │   │   ├── content-modeling-agent.ts    # Schema generation agent
│   │   │   └── weather-agent.ts             # Example agent
│   │   ├── tools/
│   │   │   ├── contentstack-tools.ts        # Contentstack API tools
│   │   │   └── weather-tool.ts              # Example tool
│   │   ├── workflows/
│   │   │   ├── onboarding-workflow.ts       # Complete onboarding flow
│   │   │   └── weather-workflow.ts          # Example workflow
│   │   ├── scorers/
│   │   │   └── weather-scorer.ts            # Example scorers
│   │   └── index.ts                         # Mastra configuration
│   ├── constants/
│   │   └── content-modelling.ts             # Content model schemas
│   └── data/
│       ├── stack.txt                        # Stack creation examples
│       ├── content-types.txt                # Content type examples
│       └── global-fields.txt                # Global field examples
├── examples/
│   └── onboarding-example.ts                # Usage examples
├── CONTENTSTACK_ONBOARDING.md               # Detailed documentation
├── README.md                                # This file
├── package.json
└── tsconfig.json
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- Additional content model templates
- More specialized agents for specific industries
- Enhanced error handling and recovery
- Integration with more Contentstack features
- UI for visual content modeling

## 📝 Notes

- The system uses OpenAI's GPT-4o for AI agents
- All Contentstack API calls use official REST APIs
- Memory is persisted using LibSQL
- The Content Modeling Agent has extensive knowledge of Contentstack conventions
- Global fields are only created when truly needed for reusability

## 🔐 Security

- Never commit `.env` files
- Store credentials securely
- Use environment variables for sensitive data
- The system makes no destructive API calls
- All stack/content type creations require explicit user confirmation (in conversational mode)

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Failed to create stack"
- **Solution**: Verify your authtoken and organization_uid are correct

**Issue**: "Content type creation failed"
- **Solution**: Ensure global fields are created before referencing them

**Issue**: Agent doesn't respond
- **Solution**: Check that OPENAI_API_KEY is set correctly

**Issue**: Workflow execution fails
- **Solution**: Verify all required fields in triggerData are provided

For more troubleshooting, see [CONTENTSTACK_ONBOARDING.md](./CONTENTSTACK_ONBOARDING.md#-troubleshooting)

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with [Mastra](https://mastra.ai)
- Powered by [Contentstack](https://www.contentstack.com)
- AI models by [OpenAI](https://openai.com)

---

**Questions or issues?** Check the [detailed documentation](./CONTENTSTACK_ONBOARDING.md) or open an issue.

