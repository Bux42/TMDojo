/* eslint-disable import/first */
// eslint-disable-next-line import/order
import { configEnv } from './env';

configEnv();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common/pipes';
import { AppModule } from './app.module';
import { corsConfig } from './common/util/cors/cors-config';
import { MyLogger } from './common/logger/my-logger.service';
import { tryGetHttpsOptions } from './common/util/https/httpsOptions';

async function bootstrap() {
    const bootstrapLogger = new MyLogger('Bootstrap');

    const httpsOptions = tryGetHttpsOptions();
    if (!httpsOptions) {
        bootstrapLogger.warn('No HTTPS key/certificate found, using HTTP instead');
    }

    const app = await NestFactory.create(AppModule, {
        cors: corsConfig,
        bufferLogs: true,
        logger: new MyLogger(),
        httpsOptions,
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.use(cookieParser());

    if (process.env.NODE_ENV === 'DEV') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('TMDojo API')
            .setDescription('Documentation for the TMDojo API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api', app, document);
    }

    await app.listen(3000);
}
bootstrap();
