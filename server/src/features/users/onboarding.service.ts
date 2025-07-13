import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { UpdateOnboardingDto } from './dto/onboarding.dto';
import { Prisma } from '../../../generated/prisma';
import { assistants } from '../chat/chat.service';
import { SubscriptionsService } from '../products/subscriptions.service';

const DEFAULT_ONBOARDING = {
  currentStep: 0,
  totalSteps: 2,
  stepData: {},
};

@Injectable()
export class OnboardingService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        onboardingStatus: true,
        onboardingCompletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Initialize if doesn't exist
    if (!user.onboardingStatus) {
      user.onboardingStatus = DEFAULT_ONBOARDING;
    }

    return user;
  }

  async updateOnboardingProgress(userId: string, dto: UpdateOnboardingDto) {
    // Check if fleet selection is being updated
    const fleetKey = dto.stepData?.preferences?.fleet;
    
    // If fleet is selected, also update the user's assistant settings
    if (fleetKey) {
      // Map fleet selection to assistant name
      const assistantName = fleetKey === '737' ? 'elal-737' : fleetKey === '787' ? 'elal-787' : null;
      
      if (assistantName) {
        // Find the assistant by name
        const assistant = assistants.find(a => a.name === assistantName);
        
        if (assistant) {
          // Get current settings
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { settings: true },
          });
          
          const currentSettings = user?.settings as Prisma.JsonObject || {};
          
          // Update settings with new assistant ID
          await prisma.user.update({
            where: { id: userId },
            data: {
              settings: {
                ...currentSettings,
                currentAssistantId: assistant.id,
              },
            },
          });
        }
      }
    }
    
    // Update onboarding status
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: dto,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        onboardingStatus: true,
        onboardingCompletedAt: true,
      },
    });

    return updated;
  }

  async completeOnboarding(userId: string) {
    // Get user's onboarding data to check fleet selection
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        onboardingStatus: true,
        onboardingCompletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user selected a fleet during onboarding
    const onboardingStatus = user.onboardingStatus as any;
    const selectedFleet = onboardingStatus?.stepData?.preferences?.fleet;

    // Create subscription based on fleet selection
    if (selectedFleet && (selectedFleet === '737' || selectedFleet === '787')) {
      try {
        // Find the product based on fleet selection
        const product = await prisma.product.findFirst({
          where: {
            name: {
              contains: selectedFleet,
              mode: 'insensitive',
            },
            deletedAt: null,
          },
          include: {
            prices: {
              where: {
                interval: 'monthly',
                deletedAt: null,
              },
            },
          },
        });

        if (product && product.prices.length > 0) {
          // Create a monthly subscription for the selected product
          await this.subscriptionsService.createSubscription(userId, {
            products: [{
              productId: product.id,
              productPriceId: product.prices[0].id,
            }],
            interval: 'monthly',
            userId,
          });

          console.log(`Created ${selectedFleet} subscription for user ${userId}`);
        }
      } catch (error) {
        console.error('Failed to create subscription during onboarding:', error);
        // Don't fail onboarding completion if subscription creation fails
      }
    }

    // Mark onboarding as completed
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompletedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        onboardingStatus: true,
        onboardingCompletedAt: true,
      },
    });

    return updated;
  }

  async resetOnboarding(userId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: Prisma.DbNull,
        onboardingCompletedAt: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        onboardingStatus: true,
        onboardingCompletedAt: true,
      },
    });

    return updated;
  }
}