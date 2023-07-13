import {
    IsInt, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindReplaysDto extends PaginationDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    userWebId?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    mapUId?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    raceFinished?: number;
}
