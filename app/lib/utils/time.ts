/* eslint-disable no-nested-ternary */
export const getRaceTimeStr = (raceTime: number): string => {
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

// helper function to omit the "s" when value is 1
export const addPlural = (time: number) => (time === 1 ? '' : 's');

export const timeDifference = (current: number, previous: number): string => {
    const msPerMinute = TIME_IN_MS.MINUTE;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        const time = Math.round(elapsed / 1000);
        return `${time} second${addPlural(time)} ago`;
    } if (elapsed < msPerHour) {
        const time = Math.round(elapsed / msPerMinute);
        return `${time} minute${addPlural(time)} ago`;
    } if (elapsed < msPerDay) {
        const time = Math.round(elapsed / msPerHour);
        return `${time} hour${addPlural(time)} ago`;
    } if (elapsed < msPerMonth) {
        const time = Math.round(elapsed / msPerDay);
        return `${time} day${addPlural(time)} ago`;
    } if (elapsed < msPerYear) {
        const time = Math.round(elapsed / msPerMonth);
        return `${time} month${addPlural(time)} ago`;
    }
    const time = Math.round(elapsed / msPerYear);
    return `${time} year${addPlural(time)} ago`;
};

export const msToTime = (duration: number) => {
    const seconds = Math.floor((duration / TIME_IN_MS.SECOND) % 60);
    const minutes = Math.floor((duration / TIME_IN_MS.MINUTE) % 60);
    const hours = Math.floor((duration / TIME_IN_MS.HOUR) % 24);
    const days = Math.floor((duration / TIME_IN_MS.DAY) % 7);
    const weeks = Math.floor((duration / TIME_IN_MS.WEEK));

    if (weeks) {
        return `${weeks} week${addPlural(weeks)}, 
        ${days} day${addPlural(days)}, 
        ${hours} hour${addPlural(hours)} 
        and ${minutes} minute${addPlural(minutes)}`;
    }
    if (days) {
        return `${days} day${addPlural(days)}, 
        ${hours} hour${addPlural(hours)} 
        and ${minutes} minute${addPlural(minutes)}`;
    }
    if (hours) {
        return `${hours} hour${addPlural(hours)} 
        and ${minutes} minute${addPlural(minutes)}`;
    }
    if (minutes) {
        return `${minutes} minute${addPlural(minutes)} 
        and ${seconds} second${addPlural(seconds)}`;
    }
    if (seconds) {
        return `${seconds} second${addPlural(seconds)}`;
    }
    return ('');
};

// Utility constants for time in milliseconds
export const TIME_IN_MS = {
    SECOND: 1_000,
    MINUTE: 60_000,
    HOUR: 3_600_000,
    DAY: 86_400_000,
    WEEK: 604_800_000,
} as const;
