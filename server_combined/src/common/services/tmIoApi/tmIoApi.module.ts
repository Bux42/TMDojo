import { Module } from '@nestjs/common';
import { TmIoApiService } from './tmIoApi.service';

@Module({
    providers: [TmIoApiService],
    exports: [TmIoApiService],
})
export class TmIoApiModule { }
