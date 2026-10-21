import { BookForm } from '@/components/books/book-form';
import { requireAdmin } from '@/lib/server/session';

export default async function NewBookPage() {
    await requireAdmin();

    return (
        <section className="space-y-8">
            <h1 className="text-3xl font-semibold">Nuevo libro</h1>
            <BookForm />
        </section>
    );
}
