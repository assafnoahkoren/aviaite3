import { prisma } from '../services/prisma';

async function createAircraftProducts() {
  console.log('Creating aircraft products...');
  
  // First, delete existing products to start fresh
  await prisma.product.deleteMany({
    where: {
      name: {
        in: [
          '737 Starter', '737 Professional', '737 Max',
          '787 Starter', '787 Professional', '787 Max'
        ]
      }
    }
  });

  // Create 737 products
  const products737 = [
    {
      name: '737 Starter',
      description: 'Basic access to Boeing 737 AI assistant',
      isRecurring: true,
      baseTokensPerMonth: 100000,
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 1999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 19999, currency: 'USD' }
        ]
      }
    },
    {
      name: '737 Professional',
      description: 'Professional access to Boeing 737 AI assistant with priority support',
      isRecurring: true,
      baseTokensPerMonth: 500000,
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 4999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 49999, currency: 'USD' }
        ]
      }
    },
    {
      name: '737 Max',
      description: 'Maximum access to Boeing 737 AI assistant with all features',
      isRecurring: true,
      baseTokensPerMonth: 2000000,
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 9999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 99999, currency: 'USD' }
        ]
      }
    }
  ];

  // Create 787 products
  const products787 = [
    {
      name: '787 Starter',
      description: 'Basic access to Boeing 787 AI assistant',
      isRecurring: true,
      baseTokensPerMonth: 100000,
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 1999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 19999, currency: 'USD' }
        ]
      }
    },
    {
      name: '787 Professional',
      description: 'Professional access to Boeing 787 AI assistant with priority support',
      isRecurring: true,
      baseTokensPerMonth: 500000,
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 4999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 49999, currency: 'USD' }
        ]
      }
    },
    {
      name: '787 Max',
      description: 'Maximum access to Boeing 787 AI assistant with all features',
      isRecurring: true,
      baseTokensPerMonth: 2000000,
      prices: {
        create: [
          { interval: 'monthly' as const, priceCents: 9999, currency: 'USD' },
          { interval: 'yearly' as const, priceCents: 99999, currency: 'USD' }
        ]
      }
    }
  ];

  // Create all products
  for (const productData of [...products737, ...products787]) {
    const product = await prisma.product.create({
      data: productData,
      include: { prices: true }
    });
    console.log(`Created product: ${product.name} with ${product.prices.length} prices`);
  }

  console.log('Aircraft products created successfully!');
}

createAircraftProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());