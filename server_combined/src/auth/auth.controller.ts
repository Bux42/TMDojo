import {
    Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenRo } from '../common/ro/access-token.ro';
import { AuthService } from './auth.service';
import { PluginLoginDto } from './dto/plugin-login.dto';
import { TmOAuthLoginDto } from './dto/tm-oauth-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login/oauth')
    async loginTmOAuth(@Body() tmOAuthLoginDto: TmOAuthLoginDto): Promise<AccessTokenRo> {
        const validatedUser = await this.authService.validateOAuthCode(tmOAuthLoginDto);
        if (!validatedUser) {
            throw new UnauthorizedException('Failed to validate OAuth code');
        }

        return this.authService.login(validatedUser);
    }

    @Post('login/plugin')
    async loginPlugin(@Body() pluginLoginDto: PluginLoginDto): Promise<AccessTokenRo> {
        const validatedUser = await this.authService.validatePluginToken(pluginLoginDto);
        if (!validatedUser) {
            throw new UnauthorizedException('Failed to validate Openplanet plugin token');
        }

        return this.authService.login(validatedUser);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
