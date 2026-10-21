import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const API = process.env.API_URL ?? 'http://localhost:3001';

const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL ?? 'demo@tractoandes.test';

const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? 'DemoPass123!';

const uniqueId = randomUUID();
const readerEmail = `audit-${uniqueId}@example.test`;
const readerPassword = 'AuditPass123!';

let testsPassed = 0;

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

    testsPassed++;
    console.log(`✓ ${name} — HTTP ${expectedStatus}`);
}

function sessionCookie(response) {
    assert.match(response.setCookie, /HttpOnly/i);

    const cookie = response.setCookie.split(';')[0];

    assert.ok(cookie.includes('tractoandes_session='));

    return cookie;
}

async function main() {
    // 1. Rutas protegidas

    verify('Perfil sin sesión', await request('/auth/me'), 401);

    verify('Catálogo sin sesión', await request('/books'), 401);

    // 2. Registro y autenticación de READER

    const registration = await request('/auth/register', 'POST', {
        name: 'Audit Reader',
        email: readerEmail,
        password: readerPassword,
    });

    verify('Registro de lector', registration, 201);

    assert.equal(registration.data.user.role, 'READER');

    verify(
        'Correo duplicado',
        await request('/auth/register', 'POST', {
            name: 'Audit Reader',
            email: readerEmail,
            password: readerPassword,
        }),
        409,
    );

    verify(
        'Impedir asignación de rol durante registro',
        await request('/auth/register', 'POST', {
            name: 'Role Injection',
            email: `injection-${uniqueId}@example.test`,
            password: readerPassword,
            role: 'ADMIN',
        }),
        400,
    );

    verify(
        'Contraseña incorrecta',
        await request('/auth/login', 'POST', {
            email: readerEmail,
            password: 'IncorrectPassword',
        }),
        401,
    );

    const readerLogin = await request('/auth/login', 'POST', {
        email: readerEmail,
        password: readerPassword,
    });

    verify('Login READER', readerLogin, 200);

    assert.equal(readerLogin.data.user.role, 'READER');

    const readerCookie = sessionCookie(readerLogin);

    const readerProfile = await request('/auth/me', 'GET', undefined, readerCookie);

    verify('Perfil READER', readerProfile, 200);

    assert.equal(readerProfile.data.role, 'READER');

    const readerBooks = await request('/books', 'GET', undefined, readerCookie);

    verify('READER puede listar libros', readerBooks, 200);

    assert.ok(Array.isArray(readerBooks.data.data));

    verify(
        'READER puede consultar géneros',
        await request('/books/genres', 'GET', undefined, readerCookie),
        200,
    );

    const book = {
        isbn: `AUDIT-${uniqueId}`,
        title: 'Libro de auditoría',
        author: 'Usuario de pruebas',
        genre: 'Pruebas',
        publicationYear: 2020,
        pages: 150,
    };

    verify(
        'READER no puede crear libros',
        await request('/books', 'POST', book, readerCookie),
        403,
    );

    // 3. Autenticación de ADMIN

    const adminLogin = await request('/auth/login', 'POST', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    verify('Login ADMIN', adminLogin, 200);

    assert.equal(adminLogin.data.user.role, 'ADMIN');

    const adminCookie = sessionCookie(adminLogin);

    const adminProfile = await request('/auth/me', 'GET', undefined, adminCookie);

    verify('Perfil ADMIN', adminProfile, 200);

    assert.equal(adminProfile.data.role, 'ADMIN');

    const listing = await request('/books', 'GET', undefined, adminCookie);

    verify('ADMIN puede listar libros', listing, 200);

    assert.ok(Array.isArray(listing.data.data));
    assert.ok(listing.data.meta.total >= 5);

    // 4. Validaciones del backend con ADMIN

    verify(
        'Páginas inválidas',
        await request('/books', 'POST', { ...book, pages: 0 }, adminCookie),
        400,
    );

    verify(
        'Año futuro',
        await request(
            '/books',
            'POST',
            {
                ...book,
                publicationYear: new Date().getFullYear() + 1,
            },
            adminCookie,
        ),
        400,
    );

    verify(
        'Título obligatorio',
        await request('/books', 'POST', { ...book, title: '' }, adminCookie),
        400,
    );

    verify(
        'Libro inexistente',
        await request(`/books/${randomUUID()}`, 'GET', undefined, adminCookie),
        404,
    );

    // 5. CRUD completo con ADMIN

    const created = await request('/books', 'POST', book, adminCookie);

    verify('ADMIN crea un libro', created, 201);

    const bookId = created.data.id;

    assert.ok(bookId);

    verify('ISBN duplicado', await request('/books', 'POST', book, adminCookie), 409);

    // 6. Comprobar que READER no modifica el libro

    const readerDetail = await request(`/books/${bookId}`, 'GET', undefined, readerCookie);

    verify('READER puede ver detalle', readerDetail, 200);

    verify(
        'READER no puede editar libros',
        await request(`/books/${bookId}`, 'PATCH', { title: 'Cambio no autorizado' }, readerCookie),
        403,
    );

    verify(
        'READER no puede eliminar libros',
        await request(`/books/${bookId}`, 'DELETE', undefined, readerCookie),
        403,
    );

    const unchanged = await request(`/books/${bookId}`, 'GET', undefined, adminCookie);

    verify('Libro permanece sin alteraciones', unchanged, 200);

    assert.equal(unchanged.data.title, book.title);

    // 7. Búsqueda, géneros y paginación

    const titleSearch = await request(
        `/books?search=${encodeURIComponent(book.title)}`,
        'GET',
        undefined,
        readerCookie,
    );

    verify('Buscar por título', titleSearch, 200);

    assert.ok(titleSearch.data.data.some((item) => item.id === bookId));

    const authorSearch = await request(
        `/books?search=${encodeURIComponent(book.author)}`,
        'GET',
        undefined,
        readerCookie,
    );

    verify('Buscar por autor', authorSearch, 200);

    assert.ok(authorSearch.data.data.some((item) => item.id === bookId));

    const genreFilter = await request(
        `/books?genre=${encodeURIComponent(book.genre)}`,
        'GET',
        undefined,
        readerCookie,
    );

    verify('Filtrar por género', genreFilter, 200);

    assert.ok(genreFilter.data.data.some((item) => item.id === bookId));

    const genres = await request('/books/genres', 'GET', undefined, readerCookie);

    verify('Consultar géneros', genres, 200);

    assert.ok(genres.data.includes(book.genre));

    verify('Géneros sin autenticación', await request('/books/genres'), 401);

    const pagination = await request('/books?page=1&limit=2', 'GET', undefined, readerCookie);

    verify('Paginar catálogo', pagination, 200);

    assert.equal(pagination.data.meta.limit, 2);
    assert.ok(pagination.data.data.length <= 2);

    verify(
        'Rechazar página inválida',
        await request('/books?page=0', 'GET', undefined, readerCookie),
        400,
    );

    verify(
        'Rechazar límite inválido',
        await request('/books?limit=51', 'GET', undefined, readerCookie),
        400,
    );

    // 8. Edición y eliminación con ADMIN

    const updated = await request(
        `/books/${bookId}`,
        'PATCH',
        { title: 'Libro actualizado' },
        adminCookie,
    );

    verify('ADMIN edita libro', updated, 200);

    assert.equal(updated.data.title, 'Libro actualizado');

    verify(
        'ADMIN elimina libro',
        await request(`/books/${bookId}`, 'DELETE', undefined, adminCookie),
        204,
    );

    verify(
        'Confirmar eliminación',
        await request(`/books/${bookId}`, 'GET', undefined, adminCookie),
        404,
    );

    // 9. Logout

    const readerLogout = await request('/auth/logout', 'POST', undefined, readerCookie);

    verify('Logout READER', readerLogout, 200);
    assert.match(readerLogout.setCookie, /expires=|max-age=0/i);

    const adminLogout = await request('/auth/logout', 'POST', undefined, adminCookie);

    verify('Logout ADMIN', adminLogout, 200);
    assert.match(adminLogout.setCookie, /expires=|max-age=0/i);

    console.log(`\n${testsPassed} pruebas HTTP completadas correctamente.`);
}

main().catch((error) => {
    console.error('\nFalló la auditoría:', error);
    process.exitCode = 1;
});
