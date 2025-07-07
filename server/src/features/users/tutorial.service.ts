import { Injectable } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { UpdateTutorialProgressDto } from './dto/tutorial-status.dto';

@Injectable()
export class TutorialService {
  async getTutorialStatus(userId: string, tutorialId: string) {
    const status = await prisma.userTutorialStatus.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
    });

    // If no status exists, create one
    if (!status) {
      return prisma.userTutorialStatus.create({
        data: {
          userId,
          tutorialId,
          currentStep: 0,
        },
      });
    }

    return status;
  }

  async completeTutorial(userId: string, tutorialId: string) {
    return prisma.userTutorialStatus.upsert({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId,
        tutorialId,
        completedAt: new Date(),
      },
    });
  }

  async skipTutorial(userId: string, tutorialId: string) {
    return prisma.userTutorialStatus.upsert({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      update: {
        skippedAt: new Date(),
      },
      create: {
        userId,
        tutorialId,
        skippedAt: new Date(),
      },
    });
  }

  async updateProgress(userId: string, tutorialId: string, dto: UpdateTutorialProgressDto) {
    return prisma.userTutorialStatus.upsert({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      update: {
        currentStep: dto.currentStep,
      },
      create: {
        userId,
        tutorialId,
        currentStep: dto.currentStep,
      },
    });
  }
}