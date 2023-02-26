import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt/dist';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TmOAuthStrategy } from './strategies/tmOAuth.strategy';
import { TmApiModule } from '../common/services/tmApi/tmApi.module';

config();

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TmApiModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '5m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, TmOAuthStrategy],
    exports: [],
})
export class AuthModule { }
