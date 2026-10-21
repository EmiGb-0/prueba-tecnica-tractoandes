import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { SessionGuard } from '../auth/guards/session/session.guard';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

@Controller('books')
@UseGuards(SessionGuard)
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get()
    findAll(@Query() query: QueryBooksDto) {
        return this.booksService.findAll(query);
    }
    @Get('genres')
    findGenres() {
        return this.booksService.findGenres();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.booksService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateBookDto) {
        return this.booksService.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookDto) {
        return this.booksService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.booksService.remove(id);
    }
}
