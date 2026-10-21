import Link from 'next/link';

import { DeleteBookButton } from '@/components/books/delete-book-button';
import { getBookGenres, getBooks } from '@/lib/server/books';

const PAGE_SIZE = 10;

interface BooksPageProps {
    searchParams: Promise<{
        search?: string | string[];
        genre?: string | string[];
        page?: string | string[];
    }>;
}

function getString(value: string | string[] | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
}

function getPage(value: string | string[] | undefined): number {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return 1;
    }

    const page = Number(value);

    return Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : 1;
}

function pageHref(page: number, search: string, genre: string): string {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (genre) params.set('genre', genre);

    params.set('page', String(page));

    return `/books?${params.toString()}`;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
    const params = await searchParams;

    const search = getString(params.search).slice(0, 150);
    const genre = getString(params.genre).slice(0, 100);
    const page = getPage(params.page);

    const [result, genres] = await Promise.all([
        getBooks({
            search,
            genre,
            page,
            limit: PAGE_SIZE,
        }),
        getBookGenres(),
    ]);

    const { data: books, meta } = result;

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold">Catálogo de libros</h2>

                    <p className="mt-2 text-zinc-400">Administra los libros del club de lectura.</p>
                </div>

                <Link
                    href="/books/new"
                    className="rounded-lg bg-emerald-500 px-5 py-3 font-medium text-zinc-950 hover:bg-emerald-400"
                >
                    Añadir libro
                </Link>
            </div>

            <form
                action="/books"
                method="GET"
                className="grid gap-4 rounded-xl border border-zinc-800 p-5 sm:grid-cols-[1fr_220px_auto]"
            >
                <div>
                    <label htmlFor="search" className="mb-2 block text-sm text-zinc-300">
                        Buscar por título o autor
                    </label>

                    <input
                        id="search"
                        name="search"
                        type="search"
                        defaultValue={search}
                        maxLength={150}
                        placeholder="Ej. Gabriel García Márquez"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label htmlFor="genre" className="mb-2 block text-sm text-zinc-300">
                        Género
                    </label>

                    <select
                        id="genre"
                        name="genre"
                        defaultValue={genre}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    >
                        <option value="">Todos los géneros</option>

                        {genres.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end gap-2">
                    <button
                        type="submit"
                        className="rounded-lg bg-emerald-500 px-5 py-3 font-medium text-zinc-950 hover:bg-emerald-400"
                    >
                        Buscar
                    </button>

                    <Link
                        href="/books"
                        className="rounded-lg border border-zinc-700 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                        Limpiar
                    </Link>
                </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-zinc-400">
                    {meta.total} libro{meta.total === 1 ? '' : 's'} encontrado
                    {meta.total === 1 ? '' : 's'}
                </p>

                <p className="text-sm text-zinc-500">Hasta {meta.limit} libros por página</p>
            </div>

            {books.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-zinc-800 p-8 text-center">
                    <p className="text-zinc-300">No se encontraron libros.</p>

                    <p className="text-sm text-zinc-500">
                        Modifica los filtros o vuelve al catálogo.
                    </p>

                    <Link
                        href="/books"
                        className="inline-block text-sm text-emerald-400 hover:underline"
                    >
                        Ver todos los libros
                    </Link>
                </div>
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
                                        <div className="flex flex-wrap items-center gap-3">
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

                                            <DeleteBookButton id={book.id} title={book.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {meta.total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-zinc-400">
                        Página {meta.page} de {meta.totalPages}
                    </p>

                    <div className="flex gap-3">
                        {meta.page > 1 ? (
                            <Link
                                href={pageHref(meta.page - 1, search, genre)}
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                            >
                                Anterior
                            </Link>
                        ) : (
                            <span className="cursor-not-allowed rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-600">
                                Anterior
                            </span>
                        )}

                        {meta.page < meta.totalPages ? (
                            <Link
                                href={pageHref(meta.page + 1, search, genre)}
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                            >
                                Siguiente
                            </Link>
                        ) : (
                            <span className="cursor-not-allowed rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-600">
                                Siguiente
                            </span>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
