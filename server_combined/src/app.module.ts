import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { MapsModule } from './maps/maps.module';
import { ReplaysModule } from './replays/replays.module';
import { UsersModule } from './users/users.module';

config();

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URL, { useUnifiedTopology: true }),
        MapsModule,
        UsersModule,
        ReplaysModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
