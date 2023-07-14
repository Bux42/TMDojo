import {
    IsBoolean,
    IsInt, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
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

    @IsOptional()
    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    withMap?: boolean;
}
