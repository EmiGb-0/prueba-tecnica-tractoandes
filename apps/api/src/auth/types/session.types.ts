import type { Request } from 'express';
import type { UserRole } from '../../generated/prisma/client';

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface SessionRequest extends Request {
    user?: SessionUser;
}
