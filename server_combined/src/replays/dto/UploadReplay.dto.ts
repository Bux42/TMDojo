export class UploadReplayDto {
    mapUId: string;
    webId: string; // TODO: can be removed once session code is done, use logged in user
    endRaceTime: number;
    raceFinished: number;
    pluginVersion: string;
    sectorTimes?: number[] | null;
}
