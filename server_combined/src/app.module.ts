import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { HttpLoggerMiddleware } from './common/middleware/httpLogger.middleware';
import { MapsModule } from './maps/maps.module';
import { PluginAuthModule } from './pluginAuth/pluginAuth.module';
import { ReplaysModule } from './replays/replays.module';
import { UsersModule } from './users/users.module';
import { AuthorizeModule } from './authorize/authorize.module';
import { AuthModule } from './auth/auth.module';
import { SetRequestIdMiddleware } from './common/middleware/setRequestId.middleware';
import { LoggerModule } from './common/logger/my-logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

config();

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URL, { useUnifiedTopology: true }),
        EventEmitterModule.forRoot(),
        MapsModule,
        UsersModule,
        ReplaysModule,
        PluginAuthModule,
        AuthorizeModule,
        AuthModule,
        LoggerModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SetRequestIdMiddleware).forRoutes('*');
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
