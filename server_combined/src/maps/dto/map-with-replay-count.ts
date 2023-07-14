import { MapRo } from './map.ro';

export class MapWithReplayCountRo extends MapRo {
    count: number;
    lastUpdate: number;
}
