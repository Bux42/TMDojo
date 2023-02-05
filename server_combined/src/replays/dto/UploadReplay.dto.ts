export class UploadReplayDto {
    mapUId: string;
    webId: string;
    endRaceTime: number;
    raceFinished: number;
    pluginVersion: string;
    sectorTimes?: number[] | null;
}
