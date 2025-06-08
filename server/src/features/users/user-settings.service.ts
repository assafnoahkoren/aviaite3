import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';
import { prisma } from '../../services/prisma';

@Injectable()
export class UserSettingsService {
  
  async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });
    return user?.settings ?? {};
  }

  async updateSettings(userId: string, settings: Prisma.JsonValue) {
    return prisma.user.update({
      where: { id: userId },
      data: { settings: settings ?? Prisma.JsonNull },
      select: { settings: true },
    });
  }

  async deleteSettings(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { settings: Prisma.JsonNull },
      select: { settings: true },
    });
  }
} 