import { IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListMapsDto extends PaginationDto {
    @IsOptional()
    mapUId?: string;

    @IsOptional()
    mapName?: string;
}
