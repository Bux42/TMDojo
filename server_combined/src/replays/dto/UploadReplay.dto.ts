export class UploadReplayDto {
    mapUId: string;
    endRaceTime: number;
    raceFinished: number;
    pluginVersion: string;
    sectorTimes?: number[] | null;
}
