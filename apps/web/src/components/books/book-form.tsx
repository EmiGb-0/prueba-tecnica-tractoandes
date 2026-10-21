'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Book, booksApi } from '@/lib/books';

const bookSchema = z.object({
    isbn: z
        .string()
        .trim()
        .min(1, 'El ISBN es obligatorio')
        .max(100, 'El ISBN no puede superar los 100 caracteres'),

    title: z
        .string()
        .trim()
        .min(1, 'El título es obligatorio')
        .max(255, 'El título no puede superar los 255 caracteres'),

    author: z
        .string()
        .trim()
        .min(1, 'El autor es obligatorio')
        .max(200, 'El autor no puede superar los 200 caracteres'),

    genre: z
        .string()
        .trim()
        .min(1, 'El género es obligatorio')
        .max(100, 'El género no puede superar los 100 caracteres'),

    publicationYear: z
        .number({ error: 'Ingresa un año de publicación válido' })
        .int('El año debe ser un número entero')
        .refine(
            (year) => year <= new Date().getFullYear(),
            'El año no puede ser mayor al año actual',
        ),

    pages: z
        .number({ error: 'Ingresa el número de páginas' })
        .int('Las páginas deben ser un número entero')
        .min(1, 'El libro debe tener al menos una página'),

    synopsis: z.string().trim().optional(),
});

type FormValues = z.infer<typeof bookSchema>;

interface BookFormProps {
    book?: Book;
}

const textFields = [
    { name: 'isbn', label: 'ISBN' },
    { name: 'title', label: 'Título' },
    { name: 'author', label: 'Autor' },
    { name: 'genre', label: 'Género' },
] as const;

export function BookForm({ book }: BookFormProps) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            isbn: book?.isbn ?? '',
            title: book?.title ?? '',
            author: book?.author ?? '',
            genre: book?.genre ?? '',
            publicationYear: book?.publicationYear ?? new Date().getFullYear(),
            pages: book?.pages ?? 1,
            synopsis: book?.synopsis ?? '',
        },
    });

    async function onSubmit(values: FormValues) {
        setServerError(null);

        try {
            const saved = await booksApi<Book>(book ? `/${book.id}` : '', {
                method: book ? 'PATCH' : 'POST',
                body: JSON.stringify(values),
            });

            router.replace(`/books/${saved.id}`);
            router.refresh();
        } catch (error: unknown) {
            setServerError(error instanceof Error ? error.message : 'No se pudo guardar el libro');
        }
    }

    const inputClass =
        'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-emerald-500';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
            {textFields.map((field) => (
                <div key={field.name}>
                    <label htmlFor={field.name} className="mb-2 block text-sm font-medium">
                        {field.label}
                    </label>

                    <input id={field.name} {...register(field.name)} className={inputClass} />

                    {errors[field.name]?.message && (
                        <p className="mt-1 text-sm text-red-400">{errors[field.name]?.message}</p>
                    )}
                </div>
            ))}

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="publicationYear" className="mb-2 block text-sm font-medium">
                        Año de publicación
                    </label>

                    <input
                        id="publicationYear"
                        type="number"
                        {...register('publicationYear', {
                            valueAsNumber: true,
                        })}
                        className={inputClass}
                    />

                    {errors.publicationYear && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.publicationYear.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="pages" className="mb-2 block text-sm font-medium">
                        Páginas
                    </label>

                    <input
                        id="pages"
                        type="number"
                        min={1}
                        {...register('pages', {
                            valueAsNumber: true,
                        })}
                        className={inputClass}
                    />

                    {errors.pages && (
                        <p className="mt-1 text-sm text-red-400">{errors.pages.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="synopsis" className="mb-2 block text-sm font-medium">
                    Sinopsis (opcional)
                </label>

                <textarea id="synopsis" rows={5} {...register('synopsis')} className={inputClass} />
            </div>

            {serverError && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300"
                >
                    {serverError}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-zinc-950 disabled:opacity-50"
                >
                    {isSubmitting ? 'Guardando...' : book ? 'Guardar cambios' : 'Crear libro'}
                </button>

                <button
                    type="button"
                    onClick={() => router.push('/books')}
                    className="rounded-lg border border-zinc-700 px-6 py-3"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
