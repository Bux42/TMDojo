import {
    Controller, Get, NotFoundException, Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { Map } from './schemas/map.schema';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    @Get()
    getMaps(): Promise<Map[]> {
        return this.mapsService.findAll();
    }

    @Get([':mapUId', ':mapUId/info'])
    async getMap(@Param('mapUId') mapUId: string): Promise<Map> {
        const map = await this.mapsService.findByMapUId(mapUId);

        if (map === null) {
            throw new NotFoundException(`Map not found: ${mapUId}`);
        }

        return map;
    }
}
