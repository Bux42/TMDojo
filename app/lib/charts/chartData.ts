import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';
import { getRaceTimeStr } from '../utils/time';

export const chartDataTemplate = (replay: ReplayData, decimalPoints: number): any => {
    const chartData: any = {
        name: `${replay.playerName} ${getRaceTimeStr(replay.endRaceTime)}`,
        data: [],
        marker: {
            enabled: false,
            radius: 3,
            lineWidth: 1,
            lineColor: '#FFFFFF',
        },
        tooltip: {
            valueDecimals: decimalPoints,
        },
        color: `#${replay.color.getHexString()}`,
    };
    return chartData;
};

export const speedChartData = (replay: ReplayData, allRaceTimes: number[]): any => {
    const chartData: any = chartDataTemplate(replay, 3);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, lastSample.speed]);
                break;
            }
        }
    });
    return chartData;
};

export const inputSteerChartData = (replay: ReplayData, allRaceTimes: number[]): any => {
    const chartData: any = chartDataTemplate(replay, 3);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, lastSample.inputSteer]);
                break;
            }
        }
    });
    return chartData;
};

export const engineRPMsChartData = (replay: ReplayData, allRaceTimes: number[]): any => {
    const chartData: any = chartDataTemplate(replay, 3);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, lastSample.engineRpm]);
                break;
            }
        }
    });
    return chartData;
};

export const engineCurrGearChartData = (replay: ReplayData, allRaceTimes: number[]): any => {
    const chartData: any = chartDataTemplate(replay, 0);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, lastSample.engineCurGear]);
                break;
            }
        }
    });
    return chartData;
};

export const inputGasPedalChartData = (replay: ReplayData, allRaceTimes: number[]): any => {
    const chartData: any = chartDataTemplate(replay, 0);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, lastSample.inputGasPedal ? 1 : 0]);
                break;
            }
        }
    });
    return chartData;
};

export const inputIsBrakingChartData = (replay: ReplayData, allRaceTimes: number[]): any => {
    const chartData: any = chartDataTemplate(replay, 0);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, lastSample.inputIsBraking ? 1 : 0]);
                break;
            }
        }
    });
    return chartData;
};
