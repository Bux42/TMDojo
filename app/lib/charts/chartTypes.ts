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
}
export const ChartTypes: { [name: string]: ChartType } = {
    speed: {
        name: 'speed',
        metrics: ['speed'],
        chartOptionsCallback: defaultChartOptions,
    },
    acceleration: {
        name: 'acceleration',
        metrics: ['acceleration'],
        chartOptionsCallback: defaultChartOptions,
    },
    inputSteer: {
        name: 'inputSteer',
        metrics: ['inputSteer'],
        chartOptionsCallback: inputSteerChartOptions,
    },
    engineRpm: {
        name: 'engineRpm',
        metrics: ['engineRpm'],
        chartOptionsCallback: defaultChartOptions,
    },
    engineCurGear: {
        name: 'engineCurGear',
        metrics: ['engineCurGear'],
        chartOptionsCallback: defaultChartOptions,
    },
    rpmsAndGear: {
        name: 'rpmsAndGear',
        metrics: ['engineRpm', 'engineCurGear'],
        chartOptionsCallback: rpmsAndGearChartOptions,
    },
    accelAndBrake: {
        name: 'accelAndBrake',
        metrics: ['inputGasPedal', 'inputIsBraking'],
        chartOptionsCallback: accelAndBrakeChartOptions,
    },
};
