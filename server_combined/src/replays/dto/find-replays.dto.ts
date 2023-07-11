import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindReplaysDto extends PaginationDto {
    @IsString()
    @IsOptional()
    userWebId?: string | undefined;

    @IsString()
    @IsOptional()
    mapUId?: string | undefined;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    raceFinished?: number | undefined;
}
