import { Module } from '@nestjs/common';
import { MapsModule } from './maps/maps.module';
import { ReplaysModule } from './replays/replays.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [MapsModule, UsersModule, ReplaysModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
