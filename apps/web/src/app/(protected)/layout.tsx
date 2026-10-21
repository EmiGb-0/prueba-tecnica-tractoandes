import { Suspense, type ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/auth/logout-button';

type SessionUser = {
    id: string;
    name: string;
    email: string;
};

async function AuthenticatedContent({ children }: { children: ReactNode }) {
    const session = (await cookies()).get('tractoandes_session')?.value;

    if (!session) {
        redirect('/login');
    }

    const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

    let user: SessionUser | null = null;

    try {
        const response = await fetch(`${apiUrl}/auth/me`, {
            headers: {
                Cookie: `tractoandes_session=${session}`,
            },
            cache: 'no-store',
        });

        if (response.ok) {
            user = (await response.json()) as SessionUser;
        }
    } catch {
        // A failed session check cannot authorize access.
    }

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <header className="border-b border-zinc-800">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h1 className="text-xl font-semibold">Crud de Libros</h1>
                        <p className="text-sm text-zinc-400">Bienvenido, {user.name}</p>
                    </div>

                    <LogoutButton />
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
    );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-zinc-950 p-10 text-zinc-300">
                    Verificando sesión...
                </main>
            }
        >
            <AuthenticatedContent>{children}</AuthenticatedContent>
        </Suspense>
    );
}
