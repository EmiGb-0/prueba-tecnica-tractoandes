import { API_URL, getApiError } from './api';

export interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    genre: string;
    publicationYear: number;
    pages: number;
    synopsis: string | null;
    createdAt: string;
    updatedAt: string;
}

export type BookInput = Pick<
    Book,
    'isbn' | 'title' | 'author' | 'genre' | 'publicationYear' | 'pages'
> & {
    synopsis?: string;
};

export async function booksApi<T>(path = '', options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}/books${path}`, {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-store',
    });

    if (response.status === 401) {
        window.location.assign('/login');
        throw new Error('Tu sesión ha expirado');
    }

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
