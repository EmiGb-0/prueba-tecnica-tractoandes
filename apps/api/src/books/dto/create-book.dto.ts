import { Transform } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateBy,
} from 'class-validator';

const Trim = () =>
    Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    );

export class CreateBookDto {
    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    isbn!: string;

    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    author!: string;

    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    genre!: string;

    @IsInt()
    @ValidateBy({
        name: 'publicationYearNotInFuture',
        validator: {
            validate(value: unknown): boolean {
                return (
                    typeof value === 'number' &&
                    Number.isInteger(value) &&
                    value <= new Date().getFullYear()
                );
            },
            defaultMessage(): string {
                return 'El año de publicación no puede superar el año actual';
            },
        },
    })
    publicationYear!: number;

    @IsInt()
    @Min(1)
    pages!: number;

    @Trim()
    @IsOptional()
    @IsString()
    synopsis?: string | null;
}
