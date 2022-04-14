import { Controller, Get, Param } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    @Get()
    getMaps(): string[] {
        return this.mapsService.getMaps();
    }

    @Get(':id')
    getMap(@Param('id') id: string): string {
        return this.mapsService.getMapById(id);
    }

    @Get(':id/info')
    getMapInfo(@Param('id') id: string): string {
        return this.mapsService.getMapInfoById(id);
    }
}
