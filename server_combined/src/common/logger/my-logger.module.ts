import { Global, Module, Scope } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Global()
@Module({
    providers: [MyLogger],
    exports: [MyLogger],
})
export class LoggerModule { }
