import Highcharts from 'highcharts/highstock';
import { getRaceTimeStr } from '../utils/time';

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
