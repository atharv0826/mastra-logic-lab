# Next.js Code Generator Agent Guide

## Overview

The **Next.js Code Generator Agent** is a specialized AI agent that generates complete, production-ready Next.js `app.tsx` files with all styles inline. It's designed to create self-contained, single-file applications that require no external CSS files or configuration.

## Key Features

✅ **Single File Output** - Everything in one `app.tsx` file  
✅ **Inline Styles Only** - All styles using the `style` prop, no external CSS  
✅ **Multi-Page Support** - Multiple pages handled via state-based routing in one file  
✅ **TypeScript First** - Fully typed components with proper interfaces  
✅ **Production Ready** - Clean, maintainable, and best-practice code  
✅ **Modern Design** - Beautiful, responsive, and accessible UI  

## Usage

### Basic Usage

```typescript
import { mastra } from '../src/mastra';

const agent = mastra.getAgent('nextjsCodeAgent');

// Generate code
const response = await agent.generate(
  'Create a landing page for a SaaS product with pricing section'
);

console.log(response.text);
```

### Conversational Usage (with Memory)

```typescript
// Start a thread for context-aware conversation
const thread = await agent.thread({ resourceid: 'user-123' });

// Initial request
const response1 = await thread.send('Create a blog homepage');

// Request modifications (agent remembers context)
const response2 = await thread.send('Add a dark mode toggle');

// Further refinements
const response3 = await thread.send('Make it more minimalist');
```

## What the Agent Generates

### Single Page Example

When you ask for a single page, you get:

```typescript
'use client';

import { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
    },
    hero: {
      padding: '80px 20px',
      textAlign: 'center' as const,
      backgroundColor: '#f8f9fa',
    },
    // ... more inline styles
  };

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1>Welcome to Our Product</h1>
        {/* Complete component code */}
      </section>
    </div>
  );
}
```

### Multi-Page Example

When you ask for multiple pages, you get state-based routing:

```typescript
'use client';

import { useState } from 'react';

type Page = 'home' | 'about' | 'contact';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const styles = {
    nav: {
      display: 'flex',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#333',
    },
    navButton: {
      padding: '10px 20px',
      background: 'none',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
    },
    // ... more styles
  };

  const Navigation = () => (
    <nav style={styles.nav}>
      <button 
        style={styles.navButton} 
        onClick={() => setCurrentPage('home')}
      >
        Home
      </button>
      <button 
        style={styles.navButton} 
        onClick={() => setCurrentPage('about')}
      >
        About
      </button>
      <button 
        style={styles.navButton} 
        onClick={() => setCurrentPage('contact')}
      >
        Contact
      </button>
    </nav>
  );

  const HomePage = () => (
    <div>
      <h1>Home Page</h1>
      {/* Home content */}
    </div>
  );

  const AboutPage = () => (
    <div>
      <h1>About Page</h1>
      {/* About content */}
    </div>
  );

  const ContactPage = () => (
    <div>
      <h1>Contact Page</h1>
      {/* Contact content */}
    </div>
  );

  return (
    <div>
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'contact' && <ContactPage />}
    </div>
  );
}
```

## Example Prompts

### Landing Pages
- "Create a SaaS landing page with hero, features, and pricing"
- "Build a product launch page with countdown timer"
- "Generate a coming soon page with email capture"

### Portfolio Sites
- "Create a portfolio with home, projects, and contact pages"
- "Build a personal website showcasing my work as a designer"
- "Generate a photography portfolio with image gallery"

### E-commerce
- "Create a product page with image gallery and reviews"
- "Build a shopping cart page with item management"
- "Generate a checkout page with form validation"

### Dashboards
- "Create an admin dashboard with sidebar navigation"
- "Build a analytics dashboard with charts (using Chart.js)"
- "Generate a user profile page with settings"

### Blogs
- "Create a blog homepage with article cards"
- "Build a blog post page with comments section"
- "Generate a blog with categories and search"

## Key Principles

### 1. Everything Inline
```typescript
// ✅ CORRECT - Inline styles
<div style={{ 
  backgroundColor: '#f0f0f0', 
  padding: '20px' 
}}>
  Content
</div>

// ❌ WRONG - External CSS
<div className="container">
  Content
</div>
```

### 2. Single File Structure
All components, styles, and logic in one `app.tsx` file:
- Main App component
- Helper components
- Style constants
- Type definitions
- All imports at top

### 3. State-Based Routing
For multiple pages, use state instead of actual routing:
```typescript
const [currentPage, setCurrentPage] = useState('home');

// Render based on state
{currentPage === 'home' && <HomePage />}
{currentPage === 'about' && <AboutPage />}
```

### 4. TypeScript Types
Always include proper typing:
```typescript
type Page = 'home' | 'about' | 'contact';
type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}
```

### 5. Style Organization
Create reusable style objects:
```typescript
const styles = {
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: '#fff',
  },
};

// Use them
<button style={{ ...styles.button, ...styles.buttonPrimary }}>
  Click Me
</button>
```

## Design Guidelines

The agent follows these design principles:

1. **Clean & Modern** - Minimalist, contemporary aesthetics
2. **Responsive** - Mobile-first, adapts to all screen sizes
3. **Accessible** - Semantic HTML, ARIA labels, good contrast
4. **Professional** - Production-ready, polished appearance
5. **Usable** - Intuitive navigation, clear CTAs, good UX

## Agent Capabilities

### What It Can Do
✅ Generate complete app.tsx files  
✅ Create single-page applications  
✅ Create multi-page applications (state-based)  
✅ Add forms with validation  
✅ Create interactive components  
✅ Implement responsive designs  
✅ Add animations and transitions  
✅ Create modals, tooltips, dropdowns  
✅ Build complex layouts (flexbox, grid)  
✅ Remember conversation context  
✅ Make iterative improvements  

### What It Won't Do
❌ Use external CSS files  
❌ Use CSS modules  
❌ Use Tailwind classes  
❌ Create separate component files  
❌ Use Next.js routing (uses state instead)  
❌ Require additional configuration  

## Tips for Best Results

1. **Be Specific** - Describe what you want in detail
   - Good: "Create a landing page with hero section, 3 feature cards, testimonials, and footer"
   - Bad: "Make a website"

2. **Mention Style Preferences** - Guide the aesthetic
   - "Make it minimalist and professional"
   - "Use a dark theme with blue accents"
   - "Create a playful, colorful design"

3. **Request Modifications Iteratively** - Use conversation
   - Start with basic structure
   - Refine in follow-up messages
   - Agent remembers context

4. **Specify Interactions** - Describe user flows
   - "Add a contact form that validates email"
   - "Create a modal that opens on button click"
   - "Add tabs to switch between sections"

5. **Mention Responsive Needs** - If mobile is critical
   - "Make it fully responsive for mobile"
   - "Ensure it works well on tablets"

## Integration with Frontend

The agent is accessible via the Mastra API and can be integrated into your frontend:

```typescript
// Frontend example (React/Next.js)
async function generateCode(userPrompt: string) {
  const response = await fetch('/api/mastra/agents/nextjsCodeAgent/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      messages: [{ role: 'user', content: userPrompt }]
    }),
  });
  
  const data = await response.json();
  return data.text; // Contains the complete app.tsx code
}
```

## Common Use Cases

### 1. Rapid Prototyping
Quickly generate UI prototypes for:
- Client presentations
- Design mockups
- MVP development
- Proof of concepts

### 2. Learning Resource
Great for:
- Understanding React patterns
- Learning inline styling
- Seeing production-ready code
- TypeScript examples

### 3. Component Library Generation
Generate:
- Form templates
- Dashboard layouts
- Landing page templates
- Authentication pages

### 4. Quick Fixes
Get instant code for:
- "Show me a better layout for this section"
- "Create a modal component"
- "Generate a pricing table"

## Example Output Structure

Every generated file follows this structure:

```typescript
// 1. Imports
'use client';
import { useState, useEffect } from 'react';

// 2. Type Definitions
type Page = 'home' | 'about';
interface FormData {
  email: string;
  name: string;
}

// 3. Main Component
export default function App() {
  // 4. State Management
  const [currentPage, setCurrentPage] = useState<Page>('home');
  
  // 5. Style Constants
  const styles = {
    // Organized style objects
  };
  
  // 6. Helper Components
  const Navigation = () => { /* ... */ };
  const HomePage = () => { /* ... */ };
  
  // 7. Main Render
  return (
    <div>
      {/* Complete UI */}
    </div>
  );
}
```

## Troubleshooting

### Issue: Code too complex for one file
**Solution**: Ask agent to simplify or break into logical sections with helper components

### Issue: Styles not responsive
**Solution**: Request "Make it fully responsive" or specify breakpoints needed

### Issue: Missing TypeScript types
**Solution**: Agent should include them by default, but you can request "Add proper TypeScript types"

### Issue: Need external library (e.g., icons)
**Solution**: Agent can include inline SVGs or recommend CDN imports

## Best Practices

1. **Start Simple** - Get basic structure first, then enhance
2. **Iterate** - Use conversation to refine the code
3. **Be Explicit** - Specify color schemes, layouts, interactions
4. **Test Immediately** - Copy code into Next.js project and test
5. **Provide Feedback** - Tell agent what to improve

## Limitations

- Cannot create separate files (everything in app.tsx)
- Cannot use external CSS frameworks (inline only)
- Cannot use Next.js file-based routing (state-based instead)
- Limited to client-side rendering patterns ('use client')
- Cannot install npm packages (but can use CDN imports)

## Advanced Features

### Dynamic Content
```typescript
// Agent can generate code with dynamic data
const products = [
  { id: 1, name: 'Product 1', price: 99 },
  { id: 2, name: 'Product 2', price: 149 },
];
```

### Form Handling
```typescript
// Complete form validation logic
const [errors, setErrors] = useState({});
const validateForm = () => { /* validation logic */ };
```

### Animations
```typescript
// CSS transitions inline
const styles = {
  button: {
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
  },
  buttonHover: {
    transform: 'scale(1.05)',
  },
};
```

## Summary

The Next.js Code Generator Agent is perfect for:
- 🚀 Rapid prototyping
- 📚 Learning React/Next.js patterns
- 🎨 Getting design inspiration
- ⚡ Quick UI generation
- 🔧 Testing ideas quickly

**Key Takeaway**: Ask for what you want, and get a complete, working app.tsx file with everything inline - no external files needed!

