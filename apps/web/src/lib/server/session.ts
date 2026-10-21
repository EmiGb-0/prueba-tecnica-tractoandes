import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type UserRole = 'ADMIN' | 'READER';

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export const getSessionUser = cache(async (): Promise<SessionUser> => {
    const session = (await cookies()).get('tractoandes_session')?.value;

    if (!session) {
        redirect('/login');
    }

    const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
            Cookie: `tractoandes_session=${session}`,
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        redirect('/login');
    }

    if (!response.ok) {
        throw new Error('No se pudo verificar la sesión');
    }

    const user = (await response.json()) as SessionUser;

    if (user.role !== 'ADMIN' && user.role !== 'READER') {
        throw new Error('El servidor devolvió un rol inválido');
    }

    return user;
});

export async function requireAdmin(): Promise<SessionUser> {
    const user = await getSessionUser();

    if (user.role !== 'ADMIN') {
        redirect('/books?forbidden=1');
    }

    return user;
}
