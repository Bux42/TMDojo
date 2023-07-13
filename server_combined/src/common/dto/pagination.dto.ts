import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

// type SortAsc = 'asc' | 'ASC' | 1
// type SortDesc = 'desc' | 'DESC' | -1

export class PaginationDto {
    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    skip?: number;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    skipPage?: number;

    // sortBy?: string;
    // sortOrder?: SortAsc | SortDesc
}
