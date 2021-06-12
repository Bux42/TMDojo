import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';
import { getEndRaceTimeStr } from '../utils/time';

// eslint-disable-next-line import/prefer-default-export

export const chartDataTemplate = (replay: ReplayData, decimalPoints: number): any => {
    const chartData: any = {
        name: `${replay.playerName} ${getEndRaceTimeStr(replay.endRaceTime)}`,
        data: [],
        marker: {
            enabled: null,
            radius: 3,
            lineWidth: 1,
            lineColor: '#FFFFFF',
        },
        tooltip: {
            valueDecimals: decimalPoints,
        },
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

export const rpmsAndGearChartData = (replay: ReplayData): any => {
    const chartData: any[] = [chartDataTemplate(replay, 0), chartDataTemplate(replay, 3)];
    chartData[0].type = 'spline';
    chartData[0].name = 'Gear';
    chartData[0].yAxis = 1;
    chartData[1].type = 'spline';
    chartData[1].name = 'RPMs';
    chartData[1].yAxis = 2;
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData[0].data.push([sample.currentRaceTime, sample.engineCurGear]);
    });
    replay.samples.forEach((sample: ReplayDataPoint) => {
        chartData[1].data.push([sample.currentRaceTime, sample.engineRpm]);
    });
    return chartData;
};
