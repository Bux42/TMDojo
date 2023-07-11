import { Module } from '@nestjs/common';
import { TmApiService } from './tm-api.service';

@Module({
    providers: [TmApiService],
    exports: [TmApiService],
})
export class TmApiModule { }
