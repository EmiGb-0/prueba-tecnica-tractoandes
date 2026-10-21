'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { booksApi } from '@/lib/books';

interface DeleteBookButtonProps {
    id: string;
    title: string;
}

export function DeleteBookButton({ id, title }: DeleteBookButtonProps) {
    const router = useRouter();

    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        const confirmed = window.confirm(`¿Estás seguro de eliminar "${title}"?`);

        if (!confirmed) return;

        setDeleting(true);
        setError(null);

        try {
            await booksApi<void>(`/${id}`, {
                method: 'DELETE',
            });

            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar el libro');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>

            {error && (
                <p role="alert" className="mt-2 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
