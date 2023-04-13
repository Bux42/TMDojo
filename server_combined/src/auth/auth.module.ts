import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt/dist';
import { config } from 'dotenv';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TmApiModule } from '../common/services/tmApi/tmApi.module';
import { OpApiModule } from '../common/services/op-api/op-api.module';

config();

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TmApiModule,
        OpApiModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '5m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [],
})
export class AuthModule { }
