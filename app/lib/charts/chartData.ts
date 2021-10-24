import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';
import { getRaceTimeStr } from '../utils/time';

const metricDecimalPoints: { [id: string]: number; } = {
    speed: 3,
    acceleration: 3,
    inputSteer: 3,
    engineRpm: 3,
    engineCurGear: 0,
    inputGasPedal: 0,
    inputIsBraking: 0,
};

function getObjProp(obj: any, prop: string) {
    return obj[prop];
}

export const chartDataTemplate = (replay: ReplayData, metric: string): any => {
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
            valueDecimals: metricDecimalPoints[metric],
        },
        color: `#${replay.color.getHexString()}`,
    };
    return chartData;
};

export const metricChartData = (replay: ReplayData, allRaceTimes: number[], metric: string): any => {
    const chartData: any = chartDataTemplate(replay, metric);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, getObjProp(lastSample, metric)]);
                break;
            }
        }
    });
    return chartData;
};
