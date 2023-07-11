/* eslint-disable indent */
/* eslint-disable camelcase */
import { IsString } from 'class-validator';

export class TmOAuthLoginDto {
    @IsString()
    code!: string;

    @IsString()
    redirect_uri!: string;
}
