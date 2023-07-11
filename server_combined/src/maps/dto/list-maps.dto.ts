import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListMapsDto extends PaginationDto {
    mapUId?: string | undefined;
    mapName?: string | undefined;
}
