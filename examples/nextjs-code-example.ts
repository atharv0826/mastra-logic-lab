/**
 * Next.js Code Generator Agent Usage Example
 * 
 * This example demonstrates how to use the nextjsCodeAgent to generate
 * complete Next.js app.tsx files with inline styles.
 */

import { mastra } from '../src/mastra';

async function generateNextjsCode() {
  const agent = mastra.getAgent('nextjsCodeAgent');

  // Example 1: Generate a simple landing page
  console.log('Example 1: Simple Landing Page');
  console.log('================================\n');
  
  const response1 = await agent.generate('Create a modern landing page for a tech startup with a hero section, features, and CTA');
  
  console.log(response1.text);
  console.log('\n---\n');

  // Example 2: Generate a multi-page portfolio
  console.log('Example 2: Multi-Page Portfolio');
  console.log('================================\n');
  
  const response2 = await agent.generate('I need a portfolio website with three pages: home with introduction, projects showcase, and contact form. Make it modern and professional.');
  
  console.log(response2.text);
  console.log('\n---\n');

  // Example 3: Generate an e-commerce product page
  console.log('Example 3: E-commerce Product Page');
  console.log('===================================\n');
  
  const response3 = await agent.generate('Create a product page for an online store with image gallery, product details, add to cart button, and reviews section');
  
  console.log(response3.text);
  console.log('\n---\n');

  // Example 4: Request modifications
  console.log('Example 4: Modifications');
  console.log('========================\n');
  
  // Start a thread for conversational context
  const thread = await agent.thread({ resourceid: 'user-123' });
  
  const initialResponse = await thread.send('Create a simple blog homepage');
  console.log('Initial request:', initialResponse.text);
  console.log('\n');
  
  const modificationResponse = await thread.send('Add a dark mode toggle and make the design more minimalist');
  console.log('After modification:', modificationResponse.text);
}

// Run the examples
generateNextjsCode().catch(console.error);

/**
 * Expected Output:
 * 
 * The agent will generate complete app.tsx files with:
 * - All imports at the top
 * - TypeScript interfaces and types
 * - Inline style objects (no external CSS)
 * - Complete, production-ready components
 * - 'use client' directive when needed
 * - For multi-page requests: state-based navigation within single file
 * 
 * Key Features:
 * - Everything in ONE app.tsx file
 * - All styles inline using style prop
 * - Clean, modern design
 * - Mobile responsive
 * - Production-ready code
 */

