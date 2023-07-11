import { TIME_IN_MS } from "../time";

export const formatRaceTime = (raceTime: number): string => {
    const sign = raceTime < 0 ? '-' : '';
    const absRaceTime = Math.abs(raceTime);

    const milliseconds = absRaceTime % TIME_IN_MS.SECOND;
    const seconds = Math.floor((absRaceTime / TIME_IN_MS.SECOND) % 60);
    const minutes = Math.floor((absRaceTime / TIME_IN_MS.MINUTE) % 60);
    const hours = Math.floor((absRaceTime / TIME_IN_MS.HOUR) % 60);

    const minutesPadded = String(minutes).padStart(2, '0');
    const secondsPadded = String(seconds).padStart(2, '0');
    const msPadded = String(milliseconds).padStart(3, '0');

    return (
        `${sign}`
        + `${`${hours > 0 ? `${hours}:` : ''}`
        + `${hours > 0 ? `${minutesPadded}:` : (minutes > 0 ? `${minutes}:` : '')}`
        + `${minutes > 0 ? secondsPadded : seconds}`
        + '.'}${msPadded}`
    );
};

export const formatRaceTimeDelta = (delta: number): string => {
    const sign = delta < 0 ? '-' : '+';
    const absDelta = Math.abs(delta);
    return `${sign}${formatRaceTime(absDelta)}`;
};
