import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { S3Module } from 'nestjs-s3';
import { MapsModule } from './maps/maps.module';
import { PluginAuthModule } from './pluginAuth/pluginAuth.module';
import { ReplaysModule } from './replays/replays.module';
import { UsersModule } from './users/users.module';

config();

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URL, { useUnifiedTopology: true }),
        S3Module.forRoot({
            config: {
                region: process.env.AWS_S3_REGION,
            },
        }),
        MapsModule,
        UsersModule,
        ReplaysModule,
        PluginAuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
