import Highcharts from 'highcharts/highstock';
import { ReplayData } from '../api/apiRequests';
import {
    accelerationChartData,
    engineCurrGearChartData,
    engineRPMsChartData,
    inputGasPedalChartData,
    inputIsBrakingChartData,
    inputSteerChartData,
    speedChartData,
} from './chartData';
import {
    accelAndBrakeChartOptions,
    defaultChartOptions,
    inputSteerChartOptions,
    rpmsAndGearChartOptions,
} from './chartOptions';

export interface ChartType {
    name: string;
    chartOptionsCallback: () => Highcharts.Options;
    chartDataCallback: ((replay: ReplayData, allRaceTimes: number[]) => any)[];
}
export const ChartTypes: { [name: string]: ChartType } = {
    speed: {
        name: 'speed',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [speedChartData],
    },
    acceleration: {
        name: 'acceleration',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [accelerationChartData],
    },
    inputSteer: {
        name: 'inputSteer',
        chartOptionsCallback: inputSteerChartOptions,
        chartDataCallback: [inputSteerChartData],
    },
    engineRPMs: {
        name: 'engineRPMs',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [engineRPMsChartData],
    },
    engineCurrGear: {
        name: 'engineCurrGear',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [engineCurrGearChartData],
    },
    rpmsAndGear: {
        name: 'rpmsAndGear',
        chartOptionsCallback: rpmsAndGearChartOptions,
        chartDataCallback: [engineCurrGearChartData, engineRPMsChartData],
    },
    accelAndBrake: {
        name: 'accelAndBrake',
        chartOptionsCallback: accelAndBrakeChartOptions,
        chartDataCallback: [inputGasPedalChartData, inputIsBrakingChartData],
    },
};
