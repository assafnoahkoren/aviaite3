const jwt = require('jwt-simple');
import { ENV } from './env';
import { User } from '../../generated/prisma';

export const JwtUtil = {
	signUserJwt(user: User): string {
		return jwt.encode(user, ENV.JWT_SECRET);
	}
} 