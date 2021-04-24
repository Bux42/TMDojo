export const getEndRaceTimeStr = (endRaceTime: string): string => {
    let ret = "";
    let i2 = 0;
    for (let i = endRaceTime.length - 1; i > -1; i--, i2++) {
        ret += endRaceTime[i];
        if (i2 == 2) {
            ret += ".";
        }
    }
    return ret.split("").reverse().join("");
};

export const timeDifference = (current: number, previous: number): string => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + " seconds ago";
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + " minutes ago";
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + " hours ago";
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + " days ago";
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + " months ago";
    } else {
        return Math.round(elapsed / msPerYear) + " years ago";
    }
};
