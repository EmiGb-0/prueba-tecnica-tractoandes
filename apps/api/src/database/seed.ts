import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as argon2 from 'argon2';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });

  try {
    const passwordHash = await argon2.hash(
      'DemoPass123!',
      { type: argon2.argon2id },
    );

    await prisma.user.upsert({
      where: {
        email: 'demo@tractoandes.test',
      },
      update: {},
      create: {
        name: 'Usuario Demo',
        email: 'demo@tractoandes.test',
        passwordHash,
      },
    });

    const books = [
      {
        isbn: 'LIB-001',
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        genre: 'Novela',
        publicationYear: 1967,
        pages: 471,
      },
      {
        isbn: 'LIB-002',
        title: '1984',
        author: 'George Orwell',
        genre: 'Ciencia ficción',
        publicationYear: 1949,
        pages: 328,
      },
      {
        isbn: 'LIB-003',
        title: 'El principito',
        author: 'Antoine de Saint-Exupéry',
        genre: 'Fábula',
        publicationYear: 1943,
        pages: 96,
      },
      {
        isbn: 'LIB-004',
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        genre: 'Novela',
        publicationYear: 1605,
        pages: 863,
      },
      {
        isbn: 'LIB-005',
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        genre: 'Ciencia ficción',
        publicationYear: 1953,
        pages: 249,
      },
    ];

    for (const book of books) {
      await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {},
        create: book,
      });
    }

    console.log('Database seeded successfully');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Database seeding failed:', error);
  process.exitCode = 1;
});