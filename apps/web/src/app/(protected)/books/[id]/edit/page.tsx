import { BookForm } from '@/components/books/book-form';
import { getBook } from '@/lib/server/books';

interface EditBookPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
    const { id } = await params;
    const book = await getBook(id);

    return (
        <section className="space-y-8">
            <h1 className="text-3xl font-semibold">Editar libro</h1>

            <BookForm book={book} />
        </section>
    );
}
