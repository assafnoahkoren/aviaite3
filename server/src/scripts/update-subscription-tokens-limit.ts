import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function updateSubscriptionTokensLimit() {
  console.log('Starting to update subscription tokens limit...');

  // Get all active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      deletedAt: null,
    },
    include: {
      subscriptionProducts: {
        include: {
          Product: true,
        },
      },
    },
  });

  console.log(`Found ${subscriptions.length} active subscriptions to update`);

  for (const subscription of subscriptions) {
    // Calculate tokens limit from products
    let tokensLimit = 0;
    
    for (const sp of subscription.subscriptionProducts) {
      if (sp.Product.baseTokensPerMonth === null) {
        // Unlimited tokens
        tokensLimit = 999999999;
        break;
      } else {
        tokensLimit += sp.Product.baseTokensPerMonth || 0;
      }
    }

    // Update the subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { tokensLimit },
    });

    console.log(`Updated subscription ${subscription.id} with tokensLimit: ${tokensLimit}`);
  }

  console.log('Finished updating subscription tokens limit');
}

updateSubscriptionTokensLimit()
  .catch((error) => {
    console.error('Error updating subscriptions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });