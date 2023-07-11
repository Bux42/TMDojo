import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TmApiModule } from '../common/modules/tm-api/tm-api.module';
import { Session, SessionSchema } from '../sessions/schemas/session.schema';
import { SessionsModule } from '../sessions/sessions.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { PluginAuthController } from './plugin-auth.controller';
import { PluginAuthService } from './plugin-auth.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
        UsersModule,
        SessionsModule,
        TmApiModule,
    ],
    controllers: [PluginAuthController],
    providers: [PluginAuthService],
    exports: [PluginAuthService],
})
export class PluginAuthModule { }
