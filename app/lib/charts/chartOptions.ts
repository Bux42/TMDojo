import { ChartType } from '../../components/maps/SidebarCharts';

export const chartOptionsTemplate = (): any => {
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
    const options = {
        credits: {
            enabled: false,
        },
        chart: {
            height: 395,
            backgroundColor: {
                linearGradient: {
                    x1: 0, y1: 0, x2: 1, y2: 1,
                },
                stops: [
                    [0, '#2B2B2C'],
                    [1, '#2B2B2C'],
                ],
            },
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
        },
        tooltip: {
            shared: true,
        },
        xAxis: {
            scrollbar: scrollBarOptions,
            type: 'number',
            opposite: false,
        },
        yAxis: {
            type: 'date',
        },
        scrollbar: scrollBarOptions,
    };
    return (options);
};

export const defaultChartOptions = (): any => {
    const options = chartOptionsTemplate();
    return options;
};

export const rpmsAndGearChartOptions = (): any => {
    const options = chartOptionsTemplate();
    options.yAxis = [{
        title: {
            text: 'RPMs',
        },
        labels: {
            format: '{value} RPMs',
        },
        lineWidth: 2,
    }, {
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
        title: {
            text: 'Gaz',
        },
        labels: {
            format: 'Gaz {value}',
        },
        lineWidth: 2,
    }, {
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
