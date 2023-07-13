import {
    Body,
    Controller, Get, NotFoundException, Param, Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionsService } from '../sessions/sessions.service';
import { AuthUrlRo } from './dto/auth-url.ro';
import { SessionIdRo } from '../common/dto/session-id.ro';
import { PluginAuthService } from './plugin-auth.service';
import { UseClientCodeDto } from './dto/use-client-code.dto';

@ApiTags('pluginAuth')
@Controller('pluginAuth')
export class PluginAuthController {
    constructor(
        private readonly pluginAuthService: PluginAuthService,
        private readonly sessionsService: SessionsService,
    ) { }

    @ApiOperation({
        summary: 'Generate OAuth URL, initializing client code and creates/updates user.',
    })
    @Get('authUrl/:webId')
    async generateAuthUrl(@Param('webId') webId: string): Promise<AuthUrlRo> {
        const authUrl = await this.pluginAuthService.generateAuthUrl(webId);

        if (!authUrl) {
            throw new NotFoundException(`User not found with webId: '${webId}'`);
        }

        return { authUrl };
    }

    @ApiOperation({
        summary: 'Use client code to get session ID, deleting client code from user doc',
    })
    @Post('useClientCode')
    async useClientCode(@Body() { clientCode }: UseClientCodeDto): Promise<SessionIdRo> {
        const session = await this.sessionsService.findSessionByClientCode(clientCode);

        if (!session) {
            throw new NotFoundException(`Session not found with client code: '${clientCode}'`);
        }

        await this.sessionsService.removeClientCodeFromSession(session.sessionId);

        return { sessionId: session.sessionId };
    }
}
