import {
    Controller, Get, NotFoundException, Param, Post, Query, Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListMapsDto } from './dto/ListMaps.dto';
import { TmIoApiService } from '../common/services/tmIoApi/tmIoApi.service';
import { MapsService } from './maps.service';
// import { MapRo } from './ro/Map.ro';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
    logger: Logger;

    constructor(
        private readonly mapsService: MapsService,
        private readonly tmIoApiService: TmIoApiService,
    ) {
        this.logger = new Logger(MapsController.name);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and add correct Ro return types',
    })
    @Get()
    findAll(@Query() listMapsDto: ListMapsDto): Promise<any[]> {
        this.logger.log(listMapsDto);
        return this.mapsService.aggregateReplaysByMap(listMapsDto);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get([':mapUId', ':mapUId/info'])
    async findOne(@Param('mapUId') mapUId: string) {
        const map = await this.mapsService.findByMapUId(mapUId);

        if (map === null) {
            throw new NotFoundException(`Map not found: ${mapUId}`);
        }

        return map;// .toRo();
    }

    @Post(':mapUId/create')
    async create(@Param('mapUId') mapUId: string) {
        return this.mapsService.findOrCreateByMapUId(mapUId);
    }

    @ApiOperation({
        summary: 'TODO: Remove',
    })
    @Get(':mapUId/tmio')
    findOneFromTmIo(@Param('mapUId') mapUId: string) {
        return this.tmIoApiService.getMapInfo(mapUId);
    }
}
