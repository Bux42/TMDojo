import {
    Body, Controller, Post, Req, Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthorizeService } from './authorize.service';
import { AuthorizeUserDto } from './dto/authorizeUser.dto';
import { AuthorizedUserRo } from './ro/authorizedUser.ro';

@ApiTags('authorize')
@Controller('authorize')
export class AuthorizeController {
    constructor(private readonly authorizeService: AuthorizeService) {}

    @ApiOperation({
        summary: 'TODO: Check for missing functionality with current back-end, and integrate auth guard',
    })
    @Post()
    async authorizeUser(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() authorizeUserDto: AuthorizeUserDto,
    ): Promise<AuthorizedUserRo> {
        const authedUser = await this.authorizeService.authorizeUser(req, res, authorizeUserDto);
        console.log({ authedUser });
        return authedUser;
    }

    @ApiOperation({
        summary: 'TODO: implement logout when sessions are implemented with AuthGuards etc.',
    })
    @Post('logout')
    async logoutUser() {
        return { message: '/logout' };
    }

    @ApiOperation({
        summary: 'TODO: implement /me of currently logged in user when sessions are implemented',
    })
    @Post('me')
    async loggedInUser() {
        return { message: '/me' };
    }
}
