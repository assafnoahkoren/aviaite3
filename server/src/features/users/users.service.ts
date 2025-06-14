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
			html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin: 20px auto; border: 1px solid #dddddd; background-color: #ffffff;">
                    <tr>
                        <td align="center" style="padding: 20px 0 20px 0; background-color: #ffffff;">
                             <img src="https://ace.aviaite.com/logos/ace-dark.png" alt="Aviaite" width="150" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 30px 30px 30px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h1 style="font-size: 24px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">Verify Your Email Address</h1>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; font-family: Arial, sans-serif;">Hi ${user.fullName || 'there'},</p>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; font-family: Arial, sans-serif;">Thank you for registering. Please click the button below to verify your email address. This link is valid for 24 hours.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 20px 0 30px 0;">
                                        <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 5px;" bgcolor="#1a73e8">
                                                    <a href="${verifyUrl}" target="_blank" style="font-size: 16px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 12px 25px; border: 1px solid #1a73e8;display: inline-block;">Verify Email Address</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                  <td>
                                    <p style="margin: 0 0 12px 0; font-size: 16px; font-family: Arial, sans-serif;">If you did not request this, please ignore this email.</p>
                                    <hr style="border: 0; border-top: 1px solid #eeeeee;">
                                    <p style="margin: 20px 0 12px 0; font-size: 14px; font-family: Arial, sans-serif; color: #999999;">If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
                                    <p style="margin: 0; font-size: 14px; font-family: Arial, sans-serif; word-break: break-all;"><a href="${verifyUrl}" style="color: #1a73e8;">${verifyUrl}</a></p>
                                  </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #eaeaea; padding: 30px 30px 30px 30px;">
                            <p style="margin: 0; color: #555555; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Aviaite. All Rights Reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
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
			html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin: 20px auto; border: 1px solid #dddddd; background-color: #ffffff;">
                    <tr>
                        <td align="center" style="padding: 20px 0 20px 0; background-color: #ffffff;">
                             <img src="https://ace.aviaite.com/logos/ace-dark.png" alt="Aviaite" width="150" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 30px 30px 30px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h1 style="font-size: 24px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">Reset Your Password</h1>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; font-family: Arial, sans-serif;">Hi ${user.fullName || 'there'},</p>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; font-family: Arial, sans-serif;">We received a request to reset your password. Please click the button below to reset it. This link is valid for 1 hour.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 20px 0 30px 0;">
                                        <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 5px;" bgcolor="#1a73e8">
                                                    <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 12px 25px; border: 1px solid #1a73e8;display: inline-block;">Reset Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                  <td>
                                    <p style="margin: 0 0 12px 0; font-size: 16px; font-family: Arial, sans-serif;">If you did not request this, please ignore this email.</p>
                                    <hr style="border: 0; border-top: 1px solid #eeeeee;">
                                    <p style="margin: 20px 0 12px 0; font-size: 14px; font-family: Arial, sans-serif; color: #999999;">If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
                                    <p style="margin: 0; font-size: 14px; font-family: Arial, sans-serif; word-break: break-all;"><a href="${resetUrl}" style="color: #1a73e8;">${resetUrl}</a></p>
                                  </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #eaeaea; padding: 30px 30px 30px 30px;">
                            <p style="margin: 0; color: #555555; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Aviaite. All Rights Reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
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