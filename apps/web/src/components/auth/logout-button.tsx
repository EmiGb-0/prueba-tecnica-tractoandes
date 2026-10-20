'use client';

import { useState } from 'react';
import { API_URL, getApiError } from '@/lib/api';

export function LogoutButton() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function logout() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                setError(await getApiError(response));
                return;
            }

            window.location.assign('/login');
        } catch {
            setError('No se pudo cerrar la sesión');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="text-right">
            <button
                type="button"
                onClick={logout}
                disabled={loading}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
            >
                {loading ? 'Cerrando...' : 'Cerrar sesión'}
            </button>

            {error && (
                <p role="alert" className="mt-2 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
