/* eslint-disable indent */
import { IsNotEmpty, IsString } from 'class-validator';

export class UseClientCodeDto {
    @IsString()
    @IsNotEmpty()
    clientCode: string;
}
