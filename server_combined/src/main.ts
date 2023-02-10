import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common/pipes';
import { AppModule } from './app.module';
import { corsConfig } from './common/cors/corsConfig';

config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: corsConfig,
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.use(cookieParser());

    if (process.env.NODE_ENV === 'dev') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('TMDojo API')
            .setDescription('Documentation for the TMDojo API')
            .setVersion('1.0')
            .build();
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api', app, document);
    }

    await app.listen(3000);
}
bootstrap();
