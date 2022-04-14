import { Module } from '@nestjs/common';
import { MapsModule } from './maps/maps.module';

@Module({
    imports: [MapsModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
