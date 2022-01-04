export const getRaceTimeStr = (raceTime: number): string => {
    const milliseconds = raceTime % 1000;
    const seconds = Math.floor((raceTime / 1000) % 60);
    const minutes = Math.floor((raceTime / (60 * 1000)) % 60);

    return (
        `${`${minutes > 0 ? `${minutes}:` : ''}`
        + `${minutes > 0 ? String(seconds).padStart(2, '0') : seconds}`
        + '.'}${String(milliseconds).padStart(3, '0')}`
    );
};

// helper function to omit the "s" when value is 1
export const addPlural = (time: number) => (time === 1 ? '' : 's');

export const timeDifference = (current: number, previous: number): string => {
    const msPerMinute = 60 * 1000;
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
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 7);
    const weeks = Math.floor((duration / (1000 * 60 * 60 * 24 * 7)));

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
