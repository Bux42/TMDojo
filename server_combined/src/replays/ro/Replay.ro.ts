import { MapRo } from '../../maps/ro/Map.ro';

export class ReplayRo {
    _id: string;
    mapRef: MapRo;
    // userRef: User;
    date: number;
    raceFinished: number;
    endRaceTime: number;
    pluginVersion?: string;
    sectorTimes?: number[];
    objectPath?: string;
    filePath?: string;
}
