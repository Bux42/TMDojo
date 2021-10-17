import Highcharts, { AxisOptions, AxisSetExtremesEventObject } from 'highcharts/highstock';
import { RangeUpdateInfos } from '../../components/maps/ChartsDrawer';
import { ReplayData } from '../api/apiRequests';
import GlobalChartsDataSingleton from '../singletons/globalChartData';
import { getRaceTimeStr } from '../utils/time';
import { ChartType } from './chartTypes';

export const globalChartOptions = (
    options: Highcharts.Options,
    replaysData: ReplayData[],
    metric: ChartType,
    replaySeries: any[],
    rangeUpdatedCallback: (rangeUpdateInfos: RangeUpdateInfos) => void,
): Highcharts.Options => {
    const globalChartsData = GlobalChartsDataSingleton.getInstance();

    // Higchart tooltip needs more space when > 5 replays are loaded
    if (options.chart && replaysData.length > 5) {
        options.chart.height = (options.chart.height as number) + (replaysData.length - 5) * 34;
    }
    // give more space when > 1 tooltip per replay
    if (options.chart && metric.chartDataCallback.length > 1) {
        options.chart.height = (options.chart.height as number) + replaysData.length * 34;
    }

    if (options.title) {
        options.title.text = metric.name;
    }
    options.series = replaySeries;
    if (options.xAxis) {
        (options.xAxis as AxisOptions).events = {
            afterSetExtremes(event: AxisSetExtremesEventObject) {
                rangeUpdatedCallback({
                    Event: event,
                    Metric: metric,
                });
            },
        };
    }

    options.plotOptions = {
        series: {
            events: {
                mouseOut: () => {
                    globalChartsData.hoveredRaceTime = undefined;
                },
            },
            point: {
                events: {
                    mouseOver: (event: any) => {
                        event.preventDefault();
                        if (!event.target.isNull && typeof event.target.x === 'number') {
                            globalChartsData.hoveredRaceTime = event.target.x;
                        }
                    },
                },
            },
        },
    };

    return options;
};

export const chartOptionsTemplate = (): Highcharts.Options => {
    const scrollBarOptions = {
        enabled: true,
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043',
    };
    const options: Highcharts.Options = {
        credits: {
            enabled: false,
        },
        chart: {
            height: 400,
            backgroundColor: '#2B2B2C',
            zoomType: 'x',
        },
        rangeSelector: {
            enabled: false,
            inputEnabled: false,
            x: 0,
            verticalAlign: 'top',
        },
        title: {
            style: {
                color: '#ffffff',
            },
            text: '',
        },
        tooltip: {
            shared: true,
            formatter() {
                return [`<b>${getRaceTimeStr(this.x)}</b><br>`].concat(
                    this.points
                        ? this.points.map((point) => `
                    <b style="color: ${point.color}">▉ </b>${point.series.name}: <b>${point.y.toFixed(3)}</b>
                    <br>`) : [],
                );
            },
        },
        xAxis: {
            scrollbar: scrollBarOptions,
            type: 'linear',
            opposite: false,
        },
        yAxis: {
            type: 'linear',
            gridLineColor: '#3f3f40',
        },
        scrollbar: scrollBarOptions,
    };
    return (options);
};

export const defaultChartOptions = (): any => {
    const options = chartOptionsTemplate();
    return options;
};

export const inputSteerChartOptions = (): any => {
    const options = chartOptionsTemplate();
    options.yAxis = {
        ...options.yAxis,
        min: -1,
        max: 1,
    };
    return options;
};

export const rpmsAndGearChartOptions = (): any => {
    const options = chartOptionsTemplate();
    options.yAxis = [{
        ...options.yAxis,
        title: {
            text: 'RPMs',
        },
        labels: {
            format: '{value} RPMs',
        },
        lineWidth: 2,
    }, {
        ...options.yAxis,
        title: {
            text: 'Gear',
        },
        labels: {
            format: 'Gear {value}',
        },
        lineWidth: 2,
        opposite: true,
    }];
    return options;
};

export const accelAndBrakeChartOptions = (): any => {
    const options = chartOptionsTemplate();
    options.yAxis = [{
        ...options.yAxis,
        title: {
            text: 'Gaz',
        },
        labels: {
            format: 'Gaz {value}',
        },
        lineWidth: 2,
    }, {
        ...options.yAxis,
        title: {
            text: 'Brake',
        },
        labels: {
            format: 'Brake {value}',
        },
        lineWidth: 2,
        opposite: true,
    }];
    return options;
};
