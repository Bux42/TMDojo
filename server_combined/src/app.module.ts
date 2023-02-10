import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { HttpLoggerMiddleware } from './common/middleware/httpLogger.middleware';
import { MapsModule } from './maps/maps.module';
import { PluginAuthModule } from './pluginAuth/pluginAuth.module';
import { ReplaysModule } from './replays/replays.module';
import { UsersModule } from './users/users.module';
import { AuthorizeModule } from './authorize/authorize.module';

config();

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URL, { useUnifiedTopology: true }),
        MapsModule,
        UsersModule,
        ReplaysModule,
        PluginAuthModule,
        AuthorizeModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
