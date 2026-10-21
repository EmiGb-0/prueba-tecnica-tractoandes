import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import type { Book } from '@/lib/books';

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

async function requestBooks<T>(path = ''): Promise<T> {
    const session = (await cookies()).get('tractoandes_session')?.value;

    if (!session) {
        redirect('/login');
    }

    const response = await fetch(`${API_INTERNAL_URL}/books${path}`, {
        method: 'GET',
        headers: {
            Cookie: `tractoandes_session=${session}`,
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        redirect('/login');
    }

    if (response.status === 404) {
        notFound();
    }

    if (!response.ok) {
        throw new Error('No se pudieron obtener los libros del servidor');
    }

    return (await response.json()) as T;
}

export async function getBooks(): Promise<Book[]> {
    return requestBooks<Book[]>();
}

export async function getBook(id: string): Promise<Book> {
    return requestBooks<Book>(`/${encodeURIComponent(id)}`);
}
