import { Module } from '@nestjs/common';
import { ArtefactsService } from './artefacts.service';
import { LocalArtefactsService } from './services/localArtefacts.service';
import { S3Service } from './services/s3.service';

@Module({
    providers: [ArtefactsService, S3Service, LocalArtefactsService],
    exports: [ArtefactsService],
})
export class ArtefactsModule { }
