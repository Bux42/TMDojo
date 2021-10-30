import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';
import { getRaceTimeStr } from '../utils/time';
import { ChartDataInfo } from './chartTypes';

export const chartDataTemplate = (replay: ReplayData): any => {
    const chartData: any = {
        name: `${replay.playerName} ${getRaceTimeStr(replay.endRaceTime)}`,
        data: [],
        marker: {
            enabled: false,
            radius: 3,
            lineWidth: 1,
            lineColor: '#FFFFFF',
        },
        color: `#${replay.color.getHexString()}`,
    };
    return chartData;
};

export const metricChartData = (
    replay: ReplayData,
    allRaceTimes: number[],
    chartDataInfo: ChartDataInfo,
): any => {
    const chartData: any = chartDataTemplate(replay);
    let lastSample: ReplayDataPoint;
    allRaceTimes.forEach((raceTime: number) => {
        for (let i = 0; i < replay.samples.length; i++) {
            lastSample = replay.samples[i];
            if (lastSample.currentRaceTime === raceTime
                || lastSample.currentRaceTime > raceTime) {
                chartData.data.push([raceTime, chartDataInfo.dataCallback(lastSample)]);
                break;
            }
        }
    });
    return chartData;
};
