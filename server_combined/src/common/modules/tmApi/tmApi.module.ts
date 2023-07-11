import { Module } from '@nestjs/common';
import { TmApiService } from './tmApi.service';

@Module({
    providers: [TmApiService],
    exports: [TmApiService],
})
export class TmApiModule { }
