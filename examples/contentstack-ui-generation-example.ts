/**
 * Contentstack Entry UI Generation Example
 * 
 * This example demonstrates how to use the Next.js Code Generator Agent
 * with Contentstack entries to create professional UI based on actual content.
 */

import { mastra } from '../src/mastra';

async function generateUIFromContentstackEntry() {
  const agent = mastra.getAgent('nextjsCodeAgent');

  console.log('========================================');
  console.log('Contentstack Entry UI Generation Examples');
  console.log('========================================\n');

  // Example 1: Generate UI for a specific blog post entry
  console.log('Example 1: Blog Post Entry UI');
  console.log('------------------------------\n');
  
  const blogResponse = await agent.generate(
    'Create a beautiful UI for my Contentstack entry: content_type "blog_post" and entry "blt123abc456def"'
  );
  
  console.log(blogResponse.text);
  console.log('\n---\n');

  // Example 2: Generate UI for homepage entry
  console.log('Example 2: Homepage Entry UI');
  console.log('-----------------------------\n');
  
  const homepageResponse = await agent.generate(
    'Generate a professional homepage from my Contentstack entry with content_type_uid: "homepage" and entry_uid: "blt789xyz"'
  );
  
  console.log(homepageResponse.text);
  console.log('\n---\n');

  // Example 3: Generate UI for product listing (all entries)
  console.log('Example 3: Product Listing UI (All Entries)');
  console.log('--------------------------------------------\n');
  
  const productListResponse = await agent.generate(
    'Create a product listing page from all my Contentstack "product" entries'
  );
  
  console.log(productListResponse.text);
  console.log('\n---\n');

  // Example 4: Conversational refinement
  console.log('Example 4: Conversational Refinement');
  console.log('-------------------------------------\n');
  
  const thread = await agent.thread({ resourceid: 'user-contentstack-123' });
  
  const initial = await thread.send(
    'Create UI for my Contentstack blog post entry: blog_post/blt123abc'
  );
  console.log('Initial UI:', initial.text);
  console.log('\n');
  
  const refined = await thread.send(
    'Make it darker theme with more emphasis on the featured image'
  );
  console.log('Refined UI:', refined.text);
  console.log('\n');
  
  const final = await thread.send(
    'Add a related posts section at the bottom'
  );
  console.log('Final UI:', final.text);
}

// Run the examples
generateUIFromContentstackEntry().catch(console.error);

/**
 * Expected Workflow:
 * 
 * 1. Agent receives request with Contentstack entry details
 * 2. Agent calls getEntryAndGenerateUITool to fetch the entry
 * 3. Tool returns:
 *    - Actual entry data (title, content, images, etc.)
 *    - Schema analysis (field types, content structure)
 *    - UI recommendations (how to display each field)
 * 4. Agent uses this information to generate:
 *    - Complete Next.js app.tsx file
 *    - Proper TypeScript components
 *    - Beautiful inline styles (gradients, shadows, animations)
 *    - ACTUAL CONTENT from the entry (not generic placeholders)
 *    - Organized sections (hero, content, metadata, footer)
 *    - Professional, best-in-class UI design
 * 
 * Example Output Structure for Blog Post:
 * 
 * ```typescript
 * 'use client';
 * 
 * export default function App() {
 *   // ACTUAL DATA from Contentstack entry
 *   const blogPost = {
 *     title: "Actual blog title from entry",
 *     content: "Actual blog content...",
 *     author: "John Doe",
 *     published_date: "2024-01-15",
 *     featured_image: "https://images.contentstack.io/...",
 *     tags: ["Technology", "AI", "Web Development"]
 *   };
 * 
 *   const styles = {
 *     // Rich, professional styles
 *   };
 * 
 *   return (
 *     <div style={styles.container}>
 *       <header style={styles.header}>
 *         <h1>{blogPost.title}</h1>
 *         <div style={styles.meta}>
 *           <span>{blogPost.author}</span>
 *           <span>{blogPost.published_date}</span>
 *         </div>
 *       </header>
 * 
 *       <img src={blogPost.featured_image} style={styles.featuredImage} />
 * 
 *       <article style={styles.content}>
 *         {blogPost.content}
 *       </article>
 * 
 *       <div style={styles.tags}>
 *         {blogPost.tags.map(tag => (
 *           <span key={tag} style={styles.tag}>{tag}</span>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Key Features:
 * - Uses REAL data from Contentstack
 * - Professional, modern design
 * - Organized component structure
 * - Inline styles (no external CSS)
 * - Best-in-class UI quality
 * - Tailored to content type structure
 */

