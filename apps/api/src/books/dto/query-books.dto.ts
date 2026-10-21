import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const Trim = () =>
    Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    );

export class QueryBooksDto {
    @IsOptional()
    @Trim()
    @IsString()
    @MaxLength(150)
    search?: string;

    @IsOptional()
    @Trim()
    @IsString()
    @MaxLength(100)
    genre?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10000)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}
