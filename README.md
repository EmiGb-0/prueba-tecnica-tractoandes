# Tractoandes — Full Stack Technical Assessment

Aplicación web para la administración de un catálogo de libros, desarrollada como prueba técnica para el puesto de **Desarrollador Full Stack**.

Permite registrar usuarios, iniciar y cerrar sesión, consultar libros y realizar operaciones de creación, edición y eliminación mediante una interfaz protegida.

El proyecto utiliza una arquitectura con frontend y backend independientes, PostgreSQL como base de datos y Docker Compose para ejecutar todos los servicios.

## 1. Stack tecnológico

| Capa            | Tecnología                    | Justificación                                                                     |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| Frontend        | Next.js 16, React, TypeScript | App Router, componentes reutilizables y renderizado del lado del servidor         |
| Estilos         | Tailwind CSS                  | Desarrollo rápido y consistente de interfaces                                     |
| Backend         | NestJS 11, TypeScript         | Arquitectura modular, inyección de dependencias y separación de responsabilidades |
| Base de datos   | PostgreSQL 17                 | Persistencia relacional y restricciones de integridad                             |
| ORM             | Prisma 7                      | Modelos tipados, migraciones y acceso estructurado a datos                        |
| Autenticación   | JWT y Argon2id                | Tokens firmados y almacenamiento seguro de contraseñas                            |
| Formularios     | React Hook Form y Zod         | Administración del estado y validaciones en frontend                              |
| Infraestructura | Docker y Docker Compose       | Entorno reproducible con servicios independientes                                 |
| Monorepo        | pnpm workspaces               | Gestión centralizada de dependencias y aplicaciones                               |

## 2. Arquitectura

```text
prueba-tecnica-tractoandes/
├── apps/
│   ├── api/              # Backend NestJS
│   │   ├── prisma/       # Esquema y migraciones
│   │   └── src/
│   │       ├── auth/     # Autenticación y guards
│   │       ├── books/    # CRUD y validaciones
│   │       └── database/ # Prisma y seed
│   └── web/              # Frontend Next.js
│       └── src/
│           ├── app/      # Rutas App Router
│           ├── components/
│           └── lib/
├── scripts/
│   └── test.mjs          # Pruebas de integración HTTP
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

**Flujo general:**

1. El usuario interactúa con la interfaz de Next.js.
2. El frontend realiza solicitudes HTTP a NestJS.
3. NestJS valida los datos y verifica la autenticación cuando corresponde.
4. Los servicios acceden a PostgreSQL mediante Prisma.
5. El backend devuelve respuestas HTTP que el frontend procesa y presenta al usuario.

Los contenedores utilizan la red interna de Docker Compose. Desde el servidor de Next.js, la API se encuentra en `http://api:3001`; desde el navegador local se accede mediante `http://localhost:3001`.

## 3. Requisitos previos

Para ejecutar la aplicación mediante Docker:

- Git.
- Docker Desktop o Docker Engine con Docker Compose.
- Puertos 3000 y 3001 disponibles.

No se necesita instalar PostgreSQL ni Node.js directamente en la máquina para utilizar el entorno de Docker.

Para desarrollo fuera de Docker se utiliza Node.js 24 y pnpm 12.8.1.

## 4. Instalación y ejecución

Clonar el repositorio:

```bash
git clone https://github.com/EmiGb-0/prueba-tecnica-tractoandes.git
cd prueba-tecnica-tractoandes
```

Levantar la aplicación completa:

```bash
docker compose up --build
```

Este comando:

1. Construye las imágenes de Next.js y NestJS.
2. Inicializa PostgreSQL con un volumen persistente.
3. Aplica automáticamente las migraciones pendientes de Prisma.
4. Ejecuta el seed para preparar los datos de demostración.
5. Inicia el backend y el frontend.

No es necesario crear manualmente tablas ni ejecutar el seed.

### Direcciones

| Servicio         | URL                            |
| ---------------- | ------------------------------ |
| Aplicación web   | http://localhost:3000          |
| Backend          | http://localhost:3001          |
| Inicio de sesión | http://localhost:3000/login    |
| Registro         | http://localhost:3000/register |
| Catálogo         | http://localhost:3000/books    |

Para ejecutar los contenedores en segundo plano:

```bash
docker compose up --build -d
```

Consultar su estado:

```bash
docker compose ps
```

Detener los servicios:

```bash
docker compose down
```

El comando anterior conserva los datos de PostgreSQL. `docker compose down -v` también elimina el volumen, por lo que debe utilizarse únicamente cuando se desee descartar la información almacenada.

## 5. Credenciales de prueba

La base de datos incluye un usuario de demostración creado automáticamente por el seed.

| Campo      | Valor                   |
| ---------- | ----------------------- |
| Correo     | `demo@tractoandes.test` |
| Contraseña | `DemoPass123!`          |

Estas credenciales son exclusivas del entorno de demostración.

El seed incluye además cinco libros iniciales y utiliza operaciones idempotentes para evitar duplicarlos al volver a ejecutarse.

## 6. Endpoints REST

**URL base:** `http://localhost:3001`

### Autenticación

| Método | Endpoint         | Descripción                     | Acceso    |
| ------ | ---------------- | ------------------------------- | --------- |
| POST   | `/auth/register` | Registrar usuario               | Público   |
| POST   | `/auth/login`    | Iniciar sesión                  | Público   |
| POST   | `/auth/logout`   | Cerrar sesión y eliminar cookie | Público   |
| GET    | `/auth/me`       | Consultar usuario autenticado   | Protegido |

### Libros

| Método | Endpoint     | Descripción       | Acceso    |
| ------ | ------------ | ----------------- | --------- |
| GET    | `/books`     | Listar libros     | Protegido |
| GET    | `/books/:id` | Consultar detalle | Protegido |
| POST   | `/books`     | Crear libro       | Protegido |
| PATCH  | `/books/:id` | Editar libro      | Protegido |
| DELETE | `/books/:id` | Eliminar libro    | Protegido |

Todos los endpoints de libros requieren autenticación.

### Modelo de libro

```json
{
    "isbn": "LIB-001",
    "title": "Cien años de soledad",
    "author": "Gabriel García Márquez",
    "genre": "Novela",
    "publicationYear": 1967,
    "pages": 471,
    "synopsis": "Descripción opcional"
}
```

El ID UUID y las fechas de creación y actualización son generados automáticamente por el sistema.

### Validaciones y errores

| Código HTTP | Descripción                                        |
| ----------- | -------------------------------------------------- |
| 200         | Operación exitosa                                  |
| 201         | Recurso creado                                     |
| 204         | Libro eliminado                                    |
| 400         | Datos inválidos                                    |
| 401         | Autenticación requerida o credenciales incorrectas |
| 404         | Recurso inexistente                                |
| 409         | Correo o ISBN duplicado                            |

El backend valida los datos independientemente del frontend. Las restricciones de unicidad también se aplican en PostgreSQL.

## 7. Autenticación y seguridad

La aplicación utiliza JWT firmado mediante HS256 y almacenado en una cookie `HttpOnly`, con una duración configurada de dos horas.

Las contraseñas se almacenan mediante hash Argon2id. Nunca se guardan ni se devuelven en texto plano.

Las rutas protegidas de Next.js verifican la sesión desde el servidor mediante `/auth/me`. El backend utiliza `SessionGuard` para proteger las operaciones del catálogo.

Se implementaron validaciones de DTOs, CORS restringido al origen configurado y una comprobación adicional de `Origin` para solicitudes que modifican datos cuando ese encabezado está presente.

### Variables de entorno

El proyecto incluye archivos `.env.example` con valores de referencia. Los archivos `.env` reales están excluidos de Git.

Variables principales:

| Variable            | Descripción                               |
| ------------------- | ----------------------------------------- |
| `POSTGRES_PASSWORD` | Contraseña local de PostgreSQL            |
| `DATABASE_URL`      | Cadena de conexión utilizada por Prisma   |
| `JWT_SECRET`        | Secreto para firmar y verificar JWT       |
| `FRONTEND_ORIGIN`   | Origen permitido del frontend             |
| `COOKIE_SECURE`     | Habilita el atributo Secure de la cookie  |
| `API_INTERNAL_URL`  | Dirección interna de la API desde Next.js |

Docker Compose proporciona valores locales de demostración cuando corresponde. Los secretos deben configurarse explícitamente en un despliegue real.

Si `JWT_SECRET` no está configurado, la API genera un secreto temporal al iniciar. En ese caso, las sesiones anteriores se invalidan al reiniciar el proceso.

El cierre de sesión elimina la cookie del navegador, pero no revoca de forma inmediata un JWT previamente extraído. Para revocación anticipada sería necesario incorporar un sistema de sesiones persistentes o revocación de tokens.

## 8. Pruebas y calidad

El proyecto incluye pruebas de integración HTTP que verifican autenticación, protección de rutas, validaciones, códigos de respuesta y CRUD de libros.

Con Docker Compose ejecutándose:

```bash
pnpm test:smoke
```

Las pruebas HTTP comprueban 19 escenarios, incluyendo respuestas 400, 401, 404 y 409.

El script crea un usuario temporal de auditoría y elimina el libro temporal después de comprobar su creación, edición y eliminación. Se recomienda ejecutarlo en un entorno de pruebas.

### Otros comandos

```bash
pnpm format:check
pnpm lint:api
pnpm lint:web
pnpm --filter api build
pnpm --filter web build
pnpm --filter api exec jest --runInBand
```

Prettier está centralizado en la raíz y utiliza una indentación de cuatro espacios.

## 9. GitHub Flow

El desarrollo se realizó mediante ramas independientes y Pull Requests hacia `main`, utilizando commits descriptivos.

Los cambios principales se distribuyeron entre:

- PR #1: inicialización del monorepositorio e infraestructura Docker.
- PR #2: PostgreSQL, Prisma, migraciones y seed.
- PR #3: autenticación completa.
- PR #4: CRUD de libros.
- PR #5: auditoría final y documentación, una vez integrado.

El historial completo puede consultarse en la sección Pull Requests del repositorio.

## 10. Decisiones técnicas

**NestJS en lugar de implementar el backend con Next.js:** se eligió un servicio independiente para cumplir la separación entre frontend y backend y mantener una arquitectura modular.

**Prisma:** facilita las migraciones versionadas, el tipado de los modelos y el acceso a PostgreSQL sin distribuir consultas SQL entre controladores.

**JWT en cookie HttpOnly:** permite mantener la autenticación sin almacenar el token en `localStorage`, reduciendo su exposición directa a JavaScript del navegador.

**Validación en ambas capas:** Zod mejora la experiencia de usuario y los DTOs de NestJS garantizan que las restricciones se apliquen aunque las solicitudes no provengan del frontend.

**Docker Compose:** permite reproducir el sistema completo y sus dependencias con un solo comando.

---

**Prueba técnica Full Stack — Tractoandes.**
