import { IsOptional } from 'class-validator';

export class ListReplaysDto {
    @IsOptional()
    mapName?: string;

    @IsOptional()
    playerName?: string;

    @IsOptional()
    mapUId?: string;

    @IsOptional()
    raceFinished?: boolean;

    @IsOptional()
    orderBy?: string;

    @IsOptional()
    maxResults?: number;
}
