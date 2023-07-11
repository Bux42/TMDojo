import {
    Controller, Get, NotFoundException, Param, Post, Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListMapsDto } from './dto/list-maps.dto';
import { TmIoApiService } from '../common/modules/tm-io-api/tm-io-api.service';
import { MapsService } from './maps.service';
import { MyLogger } from '../common/logger/my-logger.service';
import { MapRo } from './ro/map.ro';
import { GroupedMapsByReplayRo } from './ro/grouped-maps-by-replay.ro';
import { TmIoMapDataDto } from '../common/modules/tm-io-api/dto/tm-io-map-data.dto';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
    constructor(
        private readonly mapsService: MapsService,
        private readonly tmIoApiService: TmIoApiService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(MapsController.name);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and add correct Ro return types',
    })
    @Get()
    findAll(@Query() listMapsDto: ListMapsDto): Promise<GroupedMapsByReplayRo[]> {
        this.logger.log(listMapsDto);
        return this.mapsService.aggregateReplaysByMap(listMapsDto);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get([':mapUId', ':mapUId/info'])
    async findOne(@Param('mapUId') mapUId: string): Promise<MapRo> {
        const map = await this.mapsService.findByMapUId(mapUId);

        if (map === null) {
            throw new NotFoundException(`Map not found: ${mapUId}`);
        }

        return map.toRo();
    }

    @Post(':mapUId/create')
    async create(@Param('mapUId') mapUId: string): Promise<MapRo> {
        const map = await this.mapsService.findOrCreateByMapUId(mapUId);

        if (map === null) {
            throw new NotFoundException(`Unable to find or create map with ID: ${mapUId}`);
        }

        return map.toRo();
    }

    @ApiOperation({
        summary: 'TODO: Remove',
    })
    @Get(':mapUId/tmio')
    async findOneFromTmIo(@Param('mapUId') mapUId: string): Promise<TmIoMapDataDto> {
        const tmIoMapData = await this.tmIoApiService.getMapInfo(mapUId);

        if (tmIoMapData === null) {
            throw new NotFoundException(`Unable to find info of map with ID: ${mapUId}`);
        }

        return tmIoMapData;
    }
}
