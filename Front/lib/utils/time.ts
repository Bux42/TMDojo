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
