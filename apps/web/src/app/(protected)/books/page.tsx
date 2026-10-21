import Link from 'next/link';

import { DeleteBookButton } from '@/components/books/delete-book-button';
import { getBooks } from '@/lib/server/books';

export default async function BooksPage() {
    const books = await getBooks();

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

            {books.length === 0 ? (
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
        </section>
    );
}
