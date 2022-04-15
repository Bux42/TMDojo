import { Module } from '@nestjs/common';
import { MapsModule } from './maps/maps.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [MapsModule, UsersModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
