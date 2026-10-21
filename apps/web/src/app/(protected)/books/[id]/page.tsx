'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Book, booksApi } from '@/lib/books';

export default function BookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<Book | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        booksApi<Book>(`/${id}`)
            .then((data) => {
                if (active) setBook(data);
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : 'No se pudo cargar el libro');
                }
            });

        return () => {
            active = false;
        };
    }, [id]);

    if (error) {
        return (
            <p role="alert" className="text-red-400">
                {error}
            </p>
        );
    }

    if (!book) {
        return <p className="text-zinc-400">Cargando libro...</p>;
    }

    return (
        <section className="max-w-3xl space-y-8">
            <div>
                <p className="mb-2 text-emerald-400">{book.genre}</p>
                <h1 className="text-4xl font-semibold">{book.title}</h1>
                <p className="mt-3 text-lg text-zinc-400">{book.author}</p>
            </div>

            <dl className="grid gap-5 rounded-xl border border-zinc-800 p-6 sm:grid-cols-2">
                <div>
                    <dt className="text-sm text-zinc-400">ISBN</dt>
                    <dd className="mt-1">{book.isbn}</dd>
                </div>

                <div>
                    <dt className="text-sm text-zinc-400">Año de publicación</dt>
                    <dd className="mt-1">{book.publicationYear}</dd>
                </div>

                <div>
                    <dt className="text-sm text-zinc-400">Páginas</dt>
                    <dd className="mt-1">{book.pages}</dd>
                </div>
            </dl>

            <div>
                <h2 className="mb-3 text-xl font-semibold">Sinopsis</h2>
                <p className="whitespace-pre-wrap text-zinc-400">
                    {book.synopsis || 'Sin sinopsis disponible.'}
                </p>
            </div>

            <div className="flex gap-4">
                <Link
                    href={`/books/${book.id}/edit`}
                    className="rounded-lg bg-emerald-500 px-5 py-3 text-zinc-950"
                >
                    Editar libro
                </Link>

                <Link href="/books" className="rounded-lg border border-zinc-700 px-5 py-3">
                    Volver
                </Link>
            </div>
        </section>
    );
}
