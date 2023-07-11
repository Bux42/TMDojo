import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt/dist';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TmApiModule } from '../common/modules/tm-api/tm-api.module';
import { OpApiModule } from '../common/modules/op-api/op-api.module';

config();

// JWT token expiration time in seconds
export const JWT_TOKEN_EXPIRATION_SECS = 60 * 60 * 24 * 31;

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TmApiModule,
        OpApiModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: JWT_TOKEN_EXPIRATION_SECS },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [],
})
export class AuthModule { }
