'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Book, booksApi } from '@/lib/books';

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        booksApi<Book[]>()
            .then((data) => {
                if (active) setBooks(data);
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(
                        err instanceof Error ? err.message : 'No se pudieron cargar los libros',
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    async function removeBook(book: Book) {
        const confirmed = window.confirm(`¿Estás seguro de eliminar "${book.title}"?`);

        if (!confirmed) return;

        setDeletingId(book.id);
        setError(null);

        try {
            await booksApi<void>(`/${book.id}`, {
                method: 'DELETE',
            });

            setBooks((current) => current.filter((item) => item.id !== book.id));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar el libro');
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold">Catálogo de libros</h2>

                    <p className="mt-2 text-zinc-400">Administra los libros del club de lectura.</p>
                </div>

                <Link
                    href="/books/new"
                    className="rounded-lg bg-emerald-500 px-5 py-3 font-medium text-zinc-950"
                >
                    Añadir libro
                </Link>
            </div>

            {error && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900 bg-red-950 p-4 text-red-300"
                >
                    {error}
                </p>
            )}

            {loading ? (
                <p className="text-zinc-400">Cargando libros...</p>
            ) : books.length === 0 ? (
                <p className="rounded-xl border border-zinc-800 p-8 text-zinc-400">
                    No hay libros registrados.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900 text-zinc-400">
                            <tr>
                                <th className="p-4">Título</th>
                                <th className="p-4">Autor</th>
                                <th className="p-4">Género</th>
                                <th className="p-4">ISBN</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {books.map((book) => (
                                <tr key={book.id} className="border-t border-zinc-800">
                                    <td className="p-4 font-medium">{book.title}</td>
                                    <td className="p-4">{book.author}</td>
                                    <td className="p-4">{book.genre}</td>
                                    <td className="p-4">{book.isbn}</td>
                                    <td className="p-4">
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/books/${book.id}`}
                                                className="text-emerald-400"
                                            >
                                                Ver
                                            </Link>

                                            <Link
                                                href={`/books/${book.id}/edit`}
                                                className="text-blue-400"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                type="button"
                                                disabled={deletingId === book.id}
                                                onClick={() => removeBook(book)}
                                                className="text-red-400 disabled:opacity-50"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
