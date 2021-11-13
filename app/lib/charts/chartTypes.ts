import Highcharts from 'highcharts/highstock';
import { ReplayDataPoint } from '../replays/replayData';
import {
    accelAndBrakeChartOptions,
    defaultChartOptions,
    inputSteerChartOptions,
    rpmAndGearChartOptions,
} from './chartOptions';

export interface ChartDataInfo {
    name: string;
    dataCallback: (replayData: ReplayDataPoint) => number;
}

export interface ChartType {
    name: string;
    chartData: ChartDataInfo[];
    chartOptionsCallback: () => Highcharts.Options;
}
export const ChartTypes: { [name: string]: ChartType } = {
    speed: {
        name: 'Speed',
        chartData: [
            {
                name: 'speed',
                dataCallback: (replayData: ReplayDataPoint) => replayData.speed,
            },
        ],
        chartOptionsCallback: defaultChartOptions,
    },
    acceleration: {
        name: 'Acceleration',
        chartData: [
            {
                name: 'acceleration',
                dataCallback: (replayData: ReplayDataPoint) => replayData.acceleration,
            },
        ],
        chartOptionsCallback: defaultChartOptions,
    },
    inputSteer: {
        name: 'Steer Input',
        chartData: [
            {
                name: 'inputSteer',
                dataCallback: (replayData: ReplayDataPoint) => replayData.inputSteer,
            },
        ],
        chartOptionsCallback: inputSteerChartOptions,
    },
    engineRpm: {
        name: 'Engine RPM',
        chartData: [
            {
                name: 'engineRpm',
                dataCallback: (replayData: ReplayDataPoint) => replayData.engineRpm,
            },
        ],
        chartOptionsCallback: defaultChartOptions,
    },
    engineCurGear: {
        name: 'Gears',
        chartData: [
            {
                name: 'engineCurGear',
                dataCallback: (replayData: ReplayDataPoint) => replayData.engineCurGear,
            },
        ],
        chartOptionsCallback: defaultChartOptions,
    },
    rpmsAndGear: {
        name: 'RPM and Gears',
        chartData: [
            {
                name: 'engineCurGear',
                dataCallback: (replayData: ReplayDataPoint) => replayData.engineCurGear,
            },
            {
                name: 'engineRpm',
                dataCallback: (replayData: ReplayDataPoint) => replayData.engineRpm,
            },
        ],
        chartOptionsCallback: rpmAndGearChartOptions,
    },
    accelAndBrake: {
        name: 'Gas and Brake inputs',
        chartData: [
            {
                name: 'inputIsBraking',
                dataCallback: (replayData: ReplayDataPoint) => replayData.inputIsBraking,
            },
            {
                name: 'inputGasPedal',
                dataCallback: (replayData: ReplayDataPoint) => replayData.inputGasPedal,
            },
        ],
        chartOptionsCallback: accelAndBrakeChartOptions,
    },
};
