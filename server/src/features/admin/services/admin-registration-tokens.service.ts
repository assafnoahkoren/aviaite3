import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@services/prisma';
import { randomBytes } from 'crypto';
import { ENV } from '@services/env';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class AdminRegistrationTokensService {
  async generateToken(label?: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    const verificationToken = await prisma.verificationToken.create({
      data: {
        entityId: '', // Empty for registration tokens
        entityType: 'user',
        kind: 'registration_permit',
        token,
        label,
        expiresAt,
      },
    });

    const registrationUrl = `${ENV.FRONTEND_URL}/register?token=${token}`;

    return {
      id: verificationToken.id,
      token: verificationToken.token,
      label: verificationToken.label,
      registrationUrl,
      expiresAt: verificationToken.expiresAt,
      createdAt: verificationToken.createdAt,
    };
  }

  async getTokens(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      prisma.verificationToken.findMany({
        where: {
          kind: 'registration_permit',
          deletedAt: null,
        },
        include: {
          usedByUser: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.verificationToken.count({
        where: {
          kind: 'registration_permit',
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: tokens.map(token => ({
        id: token.id,
        token: token.token.substring(0, 8) + '...', // Show partial token for security
        label: token.label,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt,
        usedByUser: token.usedByUser,
        isExpired: token.expiresAt < new Date(),
        isUsed: !!token.usedAt,
        registrationUrl: `${ENV.FRONTEND_URL}/register?token=${token.token}`,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteToken(tokenId: string) {
    const token = await prisma.verificationToken.findFirst({
      where: {
        id: tokenId,
        kind: 'registration_permit',
        deletedAt: null,
      },
    });

    if (!token) {
      throw new NotFoundException('Registration token not found');
    }

    if (token.usedAt) {
      throw new BadRequestException('Cannot delete a used token');
    }

    await prisma.verificationToken.update({
      where: { id: tokenId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Token deleted successfully' };
  }
}
