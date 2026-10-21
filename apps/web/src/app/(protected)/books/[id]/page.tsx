import Link from 'next/link';

import { getBook } from '@/lib/server/books';

interface BookDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
    const { id } = await params;
    const book = await getBook(id);

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
