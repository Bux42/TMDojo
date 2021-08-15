import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';
import { getRaceTimeStr } from '../utils/time';

// eslint-disable-next-line import/prefer-default-export

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

export const speedChartData = (replay: ReplayData): any => {
    const chartData: any = chartDataTemplate(replay, 3);
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData.data.push([sample.currentRaceTime, sample.speed]);
    });
    return chartData;
};

export const inputSteerChartData = (replay: ReplayData): any => {
    const chartData: any = chartDataTemplate(replay, 3);
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData.data.push([sample.currentRaceTime, sample.inputSteer]);
    });
    return chartData;
};

export const engineRPMsChartData = (replay: ReplayData): any => {
    const chartData: any = chartDataTemplate(replay, 3);
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData.data.push([sample.currentRaceTime, sample.engineRpm]);
    });
    return chartData;
};

export const engineCurrGearChartData = (replay: ReplayData): any => {
    const chartData: any = chartDataTemplate(replay, 0);
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData.data.push([sample.currentRaceTime, sample.engineCurGear]);
    });
    return chartData;
};

export const inputGazPedalChartData = (replay: ReplayData): any => {
    const chartData: any = chartDataTemplate(replay, 0);
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData.data.push([sample.currentRaceTime, sample.inputGasPedal ? 1 : 0]);
    });
    return chartData;
};

export const inputIsBrakingChartData = (replay: ReplayData): any => {
    const chartData: any = chartDataTemplate(replay, 0);
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData.data.push([sample.currentRaceTime, sample.inputIsBraking ? 1 : 0]);
    });
    return chartData;
};
