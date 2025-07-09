import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { UpdateOnboardingDto } from './dto/onboarding.dto';

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
}