import { prisma } from '../services/prisma';

async function simplifyProducts() {
  console.log('Simplifying products to 787 and 737 with unlimited tokens...');
  
  // First, delete all existing products
  await prisma.product.deleteMany({});
  console.log('Deleted all existing products');

  // Create simplified products
  const products = [
    {
      name: '737 Assistant',
      description: 'Full access to Boeing 737 AI assistant with unlimited tokens',
      isRecurring: true,
      baseTokensPerMonth: null, // null means unlimited
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 4999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 49999, currency: 'USD' }
        ]
      }
    },
    {
      name: '787 Assistant',
      description: 'Full access to Boeing 787 AI assistant with unlimited tokens',
      isRecurring: true,
      baseTokensPerMonth: null, // null means unlimited
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 4999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 49999, currency: 'USD' }
        ]
      }
    }
  ];

  // Create the products
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
      include: { prices: true }
    });
    console.log(`Created product: ${product.name} with unlimited tokens at $${product.prices[0].priceCents / 100}/month`);
  }

  console.log('Products simplified successfully!');
}

simplifyProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());