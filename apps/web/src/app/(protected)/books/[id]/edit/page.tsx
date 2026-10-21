'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { BookForm } from '@/components/books/book-form';
import { Book, booksApi } from '@/lib/books';

export default function EditBookPage() {
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
        <section className="space-y-8">
            <h1 className="text-3xl font-semibold">Editar libro</h1>
            <BookForm key={book.id} book={book} />
        </section>
    );
}
