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
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
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
		const token = JwtUtil.signUserJwt(user);
		const { password, ...userWithoutPassword } = user;
		return { message: 'Login successful', userId: user.id, token, user: userWithoutPassword };
	}

	async verify(userId: string, token: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
		const record = await prisma.verificationToken.findFirst({
			where: {
				entityId: userId,
				entityType: 'user',
				kind: 'email_verification',
				token,
				usedAt: null,
				expiresAt: { gt: new Date() },
			},
		});
		if (!record) {
			return { success: false, message: 'Invalid or expired verification token.' };
		}
		const updatedUser = await prisma.user.update({ where: { id: userId }, data: { verified: true } });
		await prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
		const jwt = JwtUtil.signUserJwt(updatedUser);
		const { password, ...userWithoutPassword } = updatedUser;
		return { success: true, message: 'Email verified successfully.', token: jwt, user: userWithoutPassword };
	}

	async createResetPasswordToken(email: string): Promise<{ success: boolean; message: string }> {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return { success: false, message: 'If an account exists, a password reset link has been sent.' };
		}

		const token = randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

		await prisma.verificationToken.create({
			data: {
				entityId: user.id,
				entityType: 'user',
				kind: 'password_reset',
				token,
				expiresAt,
			},
		});

		const resetUrl = `${ENV.FRONTEND_URL}/reset-password?userId=${user.id}&token=${token}`;
		await smtpService.sendMail({
			to: [{ email: user.email, name: user.fullName || undefined }],
			subject: 'Reset your password',
			html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
		});

		return { success: true, message: 'If an account exists, a password reset link has been sent.' };
	}

	async resetPassword(userId: string, token: string, newPassword: string): Promise<{ success: boolean; message: string; user?: any }> {
		const record = await prisma.verificationToken.findFirst({
			where: {
				entityId: userId,
				entityType: 'user',
				kind: 'password_reset',
				token,
				usedAt: null,
				expiresAt: { gt: new Date() },
			},
		});

		if (!record) {
			return { success: false, message: 'Invalid or expired reset token.' };
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUser = await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
		await prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

		const { password, ...userWithoutPassword } = updatedUser;
		return { success: true, message: 'Password has been reset successfully.', user: userWithoutPassword };
	}
} 