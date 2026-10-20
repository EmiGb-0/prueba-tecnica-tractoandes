import type { Request } from 'express';

export interface SessionUser {
    id: string;
    name: string;
    email: string;
}

export interface SessionRequest extends Request {
    user?: SessionUser;
}
