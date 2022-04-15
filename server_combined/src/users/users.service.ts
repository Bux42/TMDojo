import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    getUserInfoByWebId(webId: string): string {
        return `User info with id ${webId}`;
    }
}
