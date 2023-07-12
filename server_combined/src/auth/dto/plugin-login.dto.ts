import { IsString } from 'class-validator';

export class PluginLoginDto {
    @IsString()
    token: string;
}
