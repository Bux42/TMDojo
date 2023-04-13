import { Module } from '@nestjs/common';
import { OpApiService } from './op-api.service';

@Module({
    providers: [OpApiService],
    exports: [OpApiService],
})
export class OpApiModule { }
