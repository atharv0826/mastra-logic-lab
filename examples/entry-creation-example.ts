import { createEntryTool } from '../src/mastra/tools/contentstack-tools';

async function createShoesHomePageEntry() {
  const result = await createEntryTool.execute({
    context: {
      api_key: process.env.CONTENTSTACK_API_KEY || '',
      authtoken: process.env.CONTENTSTACK_AUTH_TOKEN || '',
      content_type_uid: 'shoes_home_page',
      locale: 'en-us',
      entry: {
        title: 'Nike Air Max Collection',
        url: '/nike-air-max-2024',
        hero_title: 'Step Into Comfort',
        hero_description: 'Discover the latest Nike Air Max collection featuring revolutionary cushioning technology',
        featured_products: [
          {
            product_card: {
              product_name: 'Nike Air Max 270',
              product_price: 150,
            },
          },
          {
            product_card: {
              product_name: 'Nike Air Max 90',
              product_price: 120,
            },
          },
          {
            product_card: {
              product_name: 'Nike Air Max Plus',
              product_price: 180,
            },
          },
        ],
      },
    },
  });

  if (result.success) {
    console.log('Entry created successfully!');
    console.log('Entry UID:', result.entry_uid);
    console.log('Title:', result.title);
  } else {
    console.error('Failed to create entry:', result.error);
  }

  return result;
}

async function createSimpleEntry() {
  const result = await createEntryTool.execute({
    context: {
      api_key: process.env.CONTENTSTACK_API_KEY || '',
      authtoken: process.env.CONTENTSTACK_AUTH_TOKEN || '',
      content_type_uid: 'blog_post',
      locale: 'en-us',
      entry: {
        title: 'Getting Started with Contentstack',
        url: '/blog/getting-started-contentstack',
        body: 'Learn how to build amazing digital experiences with Contentstack',
        author: 'John Doe',
        publish_date: new Date().toISOString(),
      },
    },
  });

  if (result.success) {
    console.log('Blog entry created successfully!');
    console.log('Entry UID:', result.entry_uid);
  } else {
    console.error('Failed to create entry:', result.error);
  }

  return result;
}

createShoesHomePageEntry();

