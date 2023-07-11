import { Module } from '@nestjs/common';
import { TmIoApiService } from './tm-io-api.service';

@Module({
    providers: [TmIoApiService],
    exports: [TmIoApiService],
})
export class TmIoApiModule { }
