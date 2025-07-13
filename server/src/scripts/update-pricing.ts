import { prisma } from '../services/prisma';

async function updatePricing() {
  console.log('Updating product pricing to $19/month...');
  
  // Update all monthly prices to $19 (1900 cents)
  const updated = await prisma.productPrice.updateMany({
    where: {
      interval: 'monthly',
      deletedAt: null,
    },
    data: {
      priceCents: 1900, // $19.00
    },
  });
  
  console.log(`Updated ${updated.count} monthly prices to $19.00`);
  
  // Also update yearly prices to $190 (10 months worth for the price of 12)
  const yearlyUpdated = await prisma.productPrice.updateMany({
    where: {
      interval: 'yearly',
      deletedAt: null,
    },
    data: {
      priceCents: 19000, // $190.00
    },
  });
  
  console.log(`Updated ${yearlyUpdated.count} yearly prices to $190.00`);
  
  // Display the updated prices
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      prices: {
        where: { deletedAt: null },
      },
    },
  });
  
  products.forEach(product => {
    console.log(`\n${product.name}:`);
    product.prices.forEach(price => {
      console.log(`  - ${price.interval}: $${price.priceCents / 100}`);
    });
  });
}

updatePricing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());