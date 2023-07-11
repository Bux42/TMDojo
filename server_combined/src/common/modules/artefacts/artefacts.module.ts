import { Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { ArtefactsService } from './artefacts.service';
import { LocalArtefactsService } from './services/localArtefacts.service';
import { S3Service } from './services/s3.service';

@Module({
    imports: [
        S3Module.forRoot({
            config: {
                region: process.env.AWS_S3_REGION,
            },
        }),
    ],
    providers: [ArtefactsService, S3Service, LocalArtefactsService],
    exports: [ArtefactsService],
})
export class ArtefactsModule { }
