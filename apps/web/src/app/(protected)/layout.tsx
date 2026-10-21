import { Suspense, type ReactNode } from 'react';

import { LogoutButton } from '@/components/auth/logout-button';
import { getSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

async function AuthenticatedContent({ children }: { children: ReactNode }) {
    const user = await getSessionUser();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <header className="border-b border-zinc-800">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h1 className="text-xl font-semibold">Club de lectura</h1>

                        <p className="text-sm text-zinc-400">Bienvenido, {user.name}</p>

                        <p className="mt-1 text-xs text-emerald-400">
                            {user.role === 'ADMIN' ? 'Administrador' : 'Lector'}
                        </p>
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
