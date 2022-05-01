export const calcIndividualSectorTimes = (sectorTimes: number[], endRaceTime: number): number[] => {
    const individualSectorTimes: number[] = [];

    // Calculate sector differences based on the previous sector times
    sectorTimes.forEach((sectorTime, i) => {
        if (i === 0) {
            // Don't calculate the difference for the first sector
            individualSectorTimes.push(sectorTime);
        } else {
            // Calculate sector time as difference between this and previous sector
            individualSectorTimes.push(sectorTime - sectorTimes[i - 1]);
        }
    });

    // Add last sector, from last CP to the finish
    individualSectorTimes.push(endRaceTime - sectorTimes[sectorTimes.length - 1]);

    return individualSectorTimes;
};

/**
 * Calculate the index of the fastest sector time for all replays
 * @param individualSectorTimes - 2D array of sector times for each replay
 *      Index order should be: individualSectorTimes[replayIndex][sectorIndex]
 * @returns array of indices of the replay that had the fastest sector time
 */
export const calcFastestSectorIndices = (individualSectorTimes: number[][]): number[] => {
    if (individualSectorTimes.length === 0) {
        return [];
    }

    const numSectors = individualSectorTimes[0].length;

    // Initialize fastestSectors
    const fastestSectors: number[] = new Array(numSectors);
    for (let sectorIndex = 0; sectorIndex < numSectors; sectorIndex++) {
        // Initialize fastestSectorTimes of each sector with replay 0
        fastestSectors[sectorIndex] = 0;
        let fastestSectorTime = individualSectorTimes[0][sectorIndex];

        // For each replay, check whether the sector time is faster than the current fastest
        for (let replayIndex = 1; replayIndex < individualSectorTimes.length; replayIndex++) {
            const sectorTime = individualSectorTimes[replayIndex][sectorIndex];
            if (sectorTime < fastestSectorTime) {
                // If replay sector time is faster, update fastest sector time and index
                fastestSectorTime = sectorTime;
                fastestSectors[sectorIndex] = replayIndex;
            }
        }
    }
    return fastestSectors;
};
