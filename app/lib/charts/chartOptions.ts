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
            height: 400,
            backgroundColor: '#2B2B2C',
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
        line: {
            marker: {
                enabled: false,
            },
        },
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
        min: -1,
        max: 1,
    };
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
