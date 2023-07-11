import { MapRo } from '../../maps/dto/map.ro';
import { UserRo } from '../../users/dto/user.ro';

export class ReplayRo {
    _id: string;
    mapRef: string;
    map?: MapRo;
    userRef: string;
    user?: UserRo;
    date: number;
    raceFinished: number;
    endRaceTime: number;
    pluginVersion?: string;
    sectorTimes?: number[];
}
