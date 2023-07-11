import { MapRo } from "../../../maps/dto/map.ro";

type MedalString = 'Author' | 'Gold' | 'Silver' | 'Bronze' | 'None';

export const getMedalFromRaceTime = (raceTime: number, map: MapRo): MedalString => {
    if (raceTime <= map.medals.author) return 'Author';
    if (raceTime <= map.medals.gold) return 'Gold';
    if (raceTime <= map.medals.silver) return 'Silver';
    if (raceTime <= map.medals.bronze) return 'Bronze';
    return 'None';
}
