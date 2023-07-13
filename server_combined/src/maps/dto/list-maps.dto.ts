import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListMapsDto extends PaginationDto {
    @IsOptional()
    @IsNotEmpty()
    mapUId?: string;

    @IsOptional()
    @IsNotEmpty()
    mapName?: string;
}
