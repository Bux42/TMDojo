export const getRaceTimeStr = (raceTime: number): string => {
    const milliseconds = raceTime % 1000;
    const seconds = Math.floor((raceTime / 1000) % 60);
    const minutes = Math.floor((raceTime / (60 * 1000)) % 60);

    return (
        `${`${minutes > 0 ? `${minutes}:` : ''}`
        + `${minutes > 0 ? String(seconds).padStart(2, '0') : seconds}`
        + '.'}${String(milliseconds).padEnd(3, '0')}`
    );
};

export const timeDifference = (current: number, previous: number): string => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    // helper function to omit the "s" when value is 1
    const addPlural = (time: number) => (time === 1 ? '' : 's');

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
