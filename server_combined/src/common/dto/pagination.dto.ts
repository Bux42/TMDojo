import { Type } from 'class-transformer';
import {
    IsInt, IsNotEmpty, IsOptional, Min,
} from 'class-validator';

// type SortAsc = 'asc' | 'ASC' | 1
// type SortDesc = 'desc' | 'DESC' | -1

export class PaginationDto {
    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    skip?: number;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    skipPage?: number;

    // sortBy?: string;
    // sortOrder?: SortAsc | SortDesc
}
