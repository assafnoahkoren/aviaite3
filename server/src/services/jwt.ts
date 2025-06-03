const jwt = require('jwt-simple');
import { ENV } from './env';
import { User } from '../../generated/prisma';

export const JwtUtil = {
	signUserJwt(user: User): string {
		const { password, ...userWithoutPassword } = user;
		return jwt.encode(userWithoutPassword, ENV.JWT_SECRET);
	},
	verifyUserJwt(token: string): Omit<User, 'password'> {
		try {
			return jwt.decode(token, ENV.JWT_SECRET);
		} catch (e) {
			throw new Error('Invalid or expired token');
		}
	}
} 