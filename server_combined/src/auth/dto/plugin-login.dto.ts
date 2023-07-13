import { IsNotEmpty, IsString } from 'class-validator';

export class PluginLoginDto {
    @IsNotEmpty()
    @IsString()
    token: string;
}
