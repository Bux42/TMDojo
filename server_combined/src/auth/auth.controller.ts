import {
    Body, Controller, Get, Logger, Post, Req, Res, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserRo } from '../users/dto/user.ro';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { AccessTokenRo } from './dto/jwt.dto';
import { PluginLoginDto } from './dto/plugin-login.dto';
import { TmOAuthLoginDto } from './dto/tm-oauth-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    logger: Logger;

    constructor(
        private readonly authService: AuthService,
    ) {
        this.logger = new Logger(AuthController.name);
    }

    @Post('login/oauth')
    async loginTmOAuth(
        @Body() tmOAuthLoginDto: TmOAuthLoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AccessTokenRo> {
        const validatedUser = await this.authService.validateOAuthCode(tmOAuthLoginDto);
        if (!validatedUser) {
            throw new UnauthorizedException('Failed to validate OAuth code');
        }

        return this.authService.login(validatedUser, req, res);
    }

    @Post('login/plugin')
    async loginPlugin(
        @Body() pluginLoginDto: PluginLoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AccessTokenRo> {
        const validatedUser = await this.authService.validatePluginToken(pluginLoginDto);
        if (!validatedUser) {
            throw new UnauthorizedException('Failed to validate Openplanet plugin token');
        }

        this.logger.log(`Validated user: ${validatedUser.playerName} (${validatedUser.webId})`);

        return this.authService.login(validatedUser, req, res);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(
        @User() user: UserRo,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.logger.log(`Logging out user: ${user.playerName} (${user._id})`);
        this.authService.logout(req, res);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@User() user: UserRo) {
        return user;
    }
}
