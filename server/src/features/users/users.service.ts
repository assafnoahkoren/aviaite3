import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { prisma } from '@services/prisma';
import { RegisterDto } from '@features/users/dto/register.dto';
import { LoginDto } from '@features/users/dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { smtpService } from '@services/smtp';
import { randomBytes } from 'crypto';
import { ENV } from '@services/env';
import { JwtUtil } from '@services/jwt';

@Injectable()
export class UsersService {
// get(UsersService).register({ fullName: 'assaf', email: 'assafnoahkoren@gmail.com', password: '123123' })
	async register(dto: RegisterDto): Promise<any> {
		const existing = await prisma.user.findFirst({ where: { email: dto.email } });
		if (existing) {
			throw new BadRequestException('Email already in use');
		}
		const hashed = await bcrypt.hash(dto.password, 10);
		const user = await prisma.user.create({
			data: {
				fullName: dto.fullName,
				email: dto.email,
				password: hashed,
				verified: false,
			},
		});
		await this.sendVerificationEmail(user);
		return { message: 'Registration successful. Please check your email to verify your account.' };
	}

	private async sendVerificationEmail(user: { id: string; email: string; fullName?: string | null }) {
		const token = randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
		await prisma.verificationToken.create({
			data: {
				entityId: user.id,
				entityType: 'user',
				kind: 'email_verification',
				token,
				expiresAt,
			},
		});
		const verifyUrl = `${ENV.FRONTEND_URL}/verify?userId=${user.id}&token=${token}`;
		await smtpService.sendMail({
			to: [{ email: user.email, name: user.fullName || undefined }],
			subject: 'Verify your account',
			html: `<p>Click <a href="${verifyUrl}">here</a> to verify your account.</p>`
		});
	}

	async login(dto: LoginDto): Promise<any> {
		const user = await prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const valid = await bcrypt.compare(dto.password, user.password);
		if (!valid) {
			throw new UnauthorizedException('Invalid credentials');
		}
		if (!user.verified) {
			throw new UnauthorizedException('Please verify your email before logging in.');
		}
		const token = JwtUtil.signUserJwt({ id: user.id, email: user.email, fullName: user.fullName || '' });
		return { message: 'Login successful', userId: user.id, token };
	}
} 