import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const API = process.env.API_URL ?? 'http://localhost:3001';
const uniqueId = randomUUID();
const email = `audit-${uniqueId}@example.test`;
const password = 'AuditPass123!';

async function request(path, method = 'GET', body, cookie) {
    const response = await fetch(`${API}${path}`, {
        method,
        headers: {
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    return {
        status: response.status,
        data,
        setCookie: response.headers.get('set-cookie') ?? '',
    };
}

function verify(name, response, expectedStatus) {
    assert.equal(
        response.status,
        expectedStatus,
        `${name}: esperado ${expectedStatus}, recibido ${response.status}. ${JSON.stringify(response.data)}`,
    );

    console.log(`✓ ${name} — HTTP ${expectedStatus}`);
}

async function main() {
    verify('Perfil sin sesión', await request('/auth/me'), 401);
    verify('Catálogo sin sesión', await request('/books'), 401);

    const registration = await request('/auth/register', 'POST', {
        name: 'Audit User',
        email,
        password,
    });

    verify('Registro de usuario', registration, 201);

    verify(
        'Correo duplicado',
        await request('/auth/register', 'POST', {
            name: 'Audit User',
            email,
            password,
        }),
        409,
    );

    verify(
        'Contraseña incorrecta',
        await request('/auth/login', 'POST', {
            email,
            password: 'IncorrectPassword',
        }),
        401,
    );

    const login = await request('/auth/login', 'POST', {
        email,
        password,
    });

    verify('Login válido', login, 200);

    assert.match(login.setCookie, /HttpOnly/i);
    const cookie = login.setCookie.split(';')[0];

    verify('Perfil autenticado', await request('/auth/me', 'GET', undefined, cookie), 200);

    const listing = await request('/books', 'GET', undefined, cookie);
    verify('Listar libros', listing, 200);
    assert.ok(Array.isArray(listing.data.data));
    assert.ok(listing.data.meta.total >= 5);

    const book = {
        isbn: `AUDIT-${uniqueId}`,
        title: 'Libro de auditoría',
        author: 'Usuario de pruebas',
        genre: 'Pruebas',
        publicationYear: 2020,
        pages: 150,
    };

    verify(
        'Páginas inválidas',
        await request('/books', 'POST', { ...book, pages: 0 }, cookie),
        400,
    );

    verify(
        'Año futuro',
        await request(
            '/books',
            'POST',
            { ...book, publicationYear: new Date().getFullYear() + 1 },
            cookie,
        ),
        400,
    );

    verify(
        'Título obligatorio',
        await request('/books', 'POST', { ...book, title: '' }, cookie),
        400,
    );

    verify(
        'Libro inexistente',
        await request(`/books/${randomUUID()}`, 'GET', undefined, cookie),
        404,
    );

    const created = await request('/books', 'POST', book, cookie);
    verify('Crear libro', created, 201);

    const bookId = created.data.id;
    assert.ok(bookId);

    verify('ISBN duplicado', await request('/books', 'POST', book, cookie), 409);

    const titleSearch = await request(
        `/books?search=${encodeURIComponent(book.title)}`,
        'GET',
        undefined,
        cookie,
    );

    verify('Buscar por título', titleSearch, 200);
    assert.ok(titleSearch.data.data.some((item) => item.id === bookId));

    const authorSearch = await request(
        `/books?search=${encodeURIComponent(book.author)}`,
        'GET',
        undefined,
        cookie,
    );

    verify('Buscar por autor', authorSearch, 200);
    assert.ok(authorSearch.data.data.some((item) => item.id === bookId));

    const genreFilter = await request(
        `/books?genre=${encodeURIComponent(book.genre)}`,
        'GET',
        undefined,
        cookie,
    );

    verify('Filtrar por género', genreFilter, 200);
    assert.ok(genreFilter.data.data.some((item) => item.id === bookId));

    const genres = await request('/books/genres', 'GET', undefined, cookie);

    verify('Consultar géneros', genres, 200);
    assert.ok(genres.data.includes(book.genre));

    verify('Proteger consulta de géneros', await request('/books/genres'), 401);

    const pagination = await request('/books?page=1&limit=2', 'GET', undefined, cookie);

    verify('Paginar catálogo', pagination, 200);
    assert.equal(pagination.data.meta.limit, 2);
    assert.ok(pagination.data.data.length <= 2);

    verify(
        'Rechazar página inválida',
        await request('/books?page=0', 'GET', undefined, cookie),
        400,
    );

    verify(
        'Rechazar límite inválido',
        await request('/books?limit=51', 'GET', undefined, cookie),
        400,
    );

    verify('Consultar detalle', await request(`/books/${bookId}`, 'GET', undefined, cookie), 200);

    const updated = await request(
        `/books/${bookId}`,
        'PATCH',
        { title: 'Libro actualizado' },
        cookie,
    );

    verify('Editar libro', updated, 200);
    assert.equal(updated.data.title, 'Libro actualizado');

    verify('Eliminar libro', await request(`/books/${bookId}`, 'DELETE', undefined, cookie), 204);

    verify(
        'Comprobar eliminación',
        await request(`/books/${bookId}`, 'GET', undefined, cookie),
        404,
    );

    const logout = await request('/auth/logout', 'POST', undefined, cookie);
    verify('Logout', logout, 200);

    assert.match(logout.setCookie, /expires=|max-age=0/i);

    console.log('\nTodas las pruebas HTTP terminaron correctamente.');
}

main().catch((error) => {
    console.error('\nFalló la auditoría:', error);
    process.exitCode = 1;
});
