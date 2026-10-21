import { BookForm } from '@/components/books/book-form';

export default function NewBookPage() {
    return (
        <section className="space-y-8">
            <h1 className="text-3xl font-semibold">Nuevo libro</h1>
            <BookForm />
        </section>
    );
}
