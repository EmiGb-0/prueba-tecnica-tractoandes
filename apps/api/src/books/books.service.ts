import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client';
import { QueryBooksDto } from './dto/query-books.dto';

import { PrismaService } from '../database/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryBooksDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: Prisma.BookWhereInput = {
            ...(query.search
                ? {
                      OR: [
                          {
                              title: {
                                  contains: query.search,
                                  mode: 'insensitive' as const,
                              },
                          },
                          {
                              author: {
                                  contains: query.search,
                                  mode: 'insensitive' as const,
                              },
                          },
                      ],
                  }
                : {}),
            ...(query.genre
                ? {
                      genre: {
                          equals: query.genre,
                          mode: 'insensitive' as const,
                      },
                  }
                : {}),
        };

        const [books, total] = await this.prisma.$transaction([
            this.prisma.book.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            }),
            this.prisma.book.count({ where }),
        ]);

        return {
            data: books,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }

    async findGenres(): Promise<string[]> {
        const genres = await this.prisma.book.findMany({
            distinct: ['genre'],
            select: {
                genre: true,
            },
            orderBy: {
                genre: 'asc',
            },
        });

        return genres.map((book) => book.genre);
    }

    async findOne(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book) {
            throw new NotFoundException('Libro no encontrado');
        }

        return book;
    }

    async create(dto: CreateBookDto) {
        try {
            return await this.prisma.book.create({
                data: {
                    isbn: dto.isbn,
                    title: dto.title,
                    author: dto.author,
                    genre: dto.genre,
                    publicationYear: dto.publicationYear,
                    pages: dto.pages,
                    synopsis: dto.synopsis ?? null,
                },
            });
        } catch (error: unknown) {
            this.handleDatabaseError(error);
        }
    }

    async update(id: string, dto: UpdateBookDto) {
        try {
            return await this.prisma.book.update({
                where: { id },
                data: dto,
            });
        } catch (error: unknown) {
            this.handleDatabaseError(error);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.prisma.book.delete({
                where: { id },
            });
        } catch (error: unknown) {
            this.handleDatabaseError(error);
        }
    }

    private handleDatabaseError(error: unknown): never {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Ya existe un libro con este ISBN');
            }

            if (error.code === 'P2025') {
                throw new NotFoundException('Libro no encontrado');
            }
        }

        throw error;
    }
}
