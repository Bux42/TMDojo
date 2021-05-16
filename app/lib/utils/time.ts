export const getEndRaceTimeStr = (endRaceTime: number): string => {
    const milliseconds = endRaceTime % 1000;
    const seconds = Math.floor((endRaceTime / 1000) % 60);
    const minutes = Math.floor((endRaceTime / (60 * 1000)) % 60);

    return (
        `${minutes > 0 ? minutes + ":" : ""}` +
        `${minutes > 0 ? (seconds < 10 ? "0" + seconds : seconds) : seconds}` +
        "." +
        milliseconds.toString().padEnd(3, "0")
    );
};

export const timeDifference = (current: number, previous: number): string => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    // helper function to omit the "s" when value is 1
    const addPlural = (time: number) => {
        return time === 1 ? "" : "s";
    };

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        const time = Math.round(elapsed / 1000);
        return `${time} second${addPlural(time)} ago`;
    } else if (elapsed < msPerHour) {
        const time = Math.round(elapsed / msPerMinute);
        return `${time} minute${addPlural(time)} ago`;
    } else if (elapsed < msPerDay) {
        const time = Math.round(elapsed / msPerHour);
        return `${time} hour${addPlural(time)} ago`;
    } else if (elapsed < msPerMonth) {
        const time = Math.round(elapsed / msPerDay);
        return `${time} day${addPlural(time)} ago`;
    } else if (elapsed < msPerYear) {
        const time = Math.round(elapsed / msPerMonth);
        return `${time} month${addPlural(time)} ago`;
    } else {
        const time = Math.round(elapsed / msPerYear);
        return `${time} year${addPlural(time)} ago`;
    }
};
