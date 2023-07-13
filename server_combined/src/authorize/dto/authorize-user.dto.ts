import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AuthorizeUserDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsUrl({ require_tld: false })
    redirect_uri: string;
}
