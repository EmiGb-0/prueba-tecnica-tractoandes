'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { API_URL, getApiError } from '@/lib/api';

type AuthMode = 'login' | 'register';

const baseSchema = z.object({
    name: z.string(),
    email: z.email('Ingresa un correo válido'),
    password: z.string().min(1, 'Ingresa tu contraseña'),
});

function getSchema(mode: AuthMode) {
    return baseSchema.superRefine((values, context) => {
        if (mode !== 'register') return;

        if (values.name.trim().length < 2) {
            context.addIssue({
                code: 'custom',
                path: ['name'],
                message: 'El nombre debe tener al menos 2 caracteres',
            });
        }

        if (values.password.length < 8) {
            context.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'La contraseña debe tener al menos 8 caracteres',
            });
        }
    });
}

type FormValues = z.infer<typeof baseSchema>;

export function AuthForm({ mode }: { mode: AuthMode }) {
    const [serverError, setServerError] = useState<string | null>(null);

    const isRegister = mode === 'register';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(getSchema(mode)),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: FormValues) {
        setServerError(null);

        try {
            const endpoint = isRegister ? 'register' : 'login';

            const body = isRegister
                ? {
                      name: values.name.trim(),
                      email: values.email,
                      password: values.password,
                  }
                : {
                      email: values.email,
                      password: values.password,
                  };

            const response = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                setServerError(await getApiError(response));
                return;
            }

            window.location.assign('/books');
        } catch {
            setServerError('No se pudo conectar con el servidor. Inténtalo nuevamente.');
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
            <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium text-emerald-400">Club de lectura</p>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        {isRegister
                            ? 'Regístrate para administrar el catálogo.'
                            : 'Accede al catálogo de libros.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {isRegister && (
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm">
                                Nombre
                            </label>

                            <input
                                id="name"
                                autoComplete="name"
                                {...register('name')}
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-emerald-500"
                                placeholder="Tu nombre"
                            />

                            {errors.name && (
                                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm">
                            Correo electrónico
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register('email')}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-emerald-500"
                            placeholder="correo@ejemplo.com"
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm">
                            Contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            {...register('password')}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-emerald-500"
                            placeholder="••••••••"
                        />

                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    {serverError && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
                        >
                            {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting
                            ? 'Procesando...'
                            : isRegister
                              ? 'Crear cuenta'
                              : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                    {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                    <Link
                        href={isRegister ? '/login' : '/register'}
                        className="font-medium text-emerald-400 hover:underline"
                    >
                        {isRegister ? 'Inicia sesión' : 'Regístrate'}
                    </Link>
                </p>
            </section>
        </main>
    );
}
