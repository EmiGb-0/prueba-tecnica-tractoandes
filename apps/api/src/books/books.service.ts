import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.book.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
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
