export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type ApiError = {
    statusCode?: number;
    message?: string | string[];
    error?: string;
};

export async function getApiError(response: Response): Promise<string> {
    const data = (await response.json().catch(() => null)) as ApiError | null;

    if (Array.isArray(data?.message)) {
        return data.message.join('. ');
    }

    return data?.message ?? 'Ocurrió un error inesperado';
}
