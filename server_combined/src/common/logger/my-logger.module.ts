import { Global, Module, Scope } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Global()
@Module({
    providers: [{
        provide: MyLogger,
        useClass: MyLogger,
        scope: Scope.REQUEST,
    }],
    exports: [MyLogger],
})
export class LoggerModule { }
