import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

// type SortAsc = 'asc' | 'ASC' | 1
// type SortDesc = 'desc' | 'DESC' | -1

export class PaginationDto {
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    limit?: number | undefined;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    skip?: number | undefined;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    skipPage?: number | undefined;

    // sortBy?: string;
    // sortOrder?: SortAsc | SortDesc
}
