import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { UpdateOnboardingDto } from './dto/onboarding.dto';
import { Prisma } from '../../../generated/prisma';
import { assistants } from '../chat/chat.service';

const DEFAULT_ONBOARDING = {
  currentStep: 0,
  totalSteps: 2,
  stepData: {},
};

@Injectable()
export class OnboardingService {
  constructor() {}

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
      // Find the assistant by name
      const assistant = assistants.find(a => a.name === fleetKey);
      
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