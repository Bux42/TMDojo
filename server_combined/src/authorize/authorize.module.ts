import { Module } from '@nestjs/common';
import { AuthorizeService } from './authorize.service';
import { AuthorizeController } from './authorize.controller';
import { TmApiModule } from '../common/services/tmApi/tmApi.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TmApiModule, SessionsModule, UsersModule],
    controllers: [AuthorizeController],
    providers: [AuthorizeService],
})
export class AuthorizeModule {}
