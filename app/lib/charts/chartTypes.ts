import Highcharts from 'highcharts/highstock';
import { ReplayData } from '../api/apiRequests';
import {
    metricChartData,
} from './chartData';
import {
    accelAndBrakeChartOptions,
    defaultChartOptions,
    inputSteerChartOptions,
    rpmsAndGearChartOptions,
} from './chartOptions';

export interface ChartType {
    name: string;
    metrics: string[];
    chartOptionsCallback: () => Highcharts.Options;
    chartDataCallback: ((replay: ReplayData, allRaceTimes: number[], metric: string) => any)[];
}
export const ChartTypes: { [name: string]: ChartType } = {
    speed: {
        name: 'speed',
        metrics: ['speed'],
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [metricChartData],
    },
    acceleration: {
        name: 'acceleration',
        metrics: ['acceleration'],
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [metricChartData],
    },
    inputSteer: {
        name: 'inputSteer',
        metrics: ['inputSteer'],
        chartOptionsCallback: inputSteerChartOptions,
        chartDataCallback: [metricChartData],
    },
    engineRpm: {
        name: 'engineRpm',
        metrics: ['engineRpm'],
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [metricChartData],
    },
    engineCurGear: {
        name: 'engineCurGear',
        metrics: ['engineCurGear'],
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [metricChartData],
    },
    rpmsAndGear: {
        name: 'rpmsAndGear',
        metrics: ['engineRpm', 'engineCurGear'],
        chartOptionsCallback: rpmsAndGearChartOptions,
        chartDataCallback: [metricChartData, metricChartData],
    },
    accelAndBrake: {
        name: 'accelAndBrake',
        metrics: ['inputGasPedal', 'inputIsBraking'],
        chartOptionsCallback: accelAndBrakeChartOptions,
        chartDataCallback: [metricChartData, metricChartData],
    },
};
