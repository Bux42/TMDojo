// Disable warning, used in highcharts tooltips using callback function
/* eslint-disable react/no-this-in-sfc */
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import bellcurve from 'highcharts/modules/histogram-bellcurve';
import { getRaceTimeStr } from '../../../lib/utils/time';
import { FileResponse } from '../../../lib/api/apiRequests';

if (typeof Highcharts === 'object') {
    bellcurve(Highcharts);
}

interface ReplayTimesHistogramProps {
    replays: FileResponse[];
    binSize: number;
}
const ReplayTimesHistogram = ({ replays, binSize }: ReplayTimesHistogramProps) => {
    const histogramBuckets = {} as { [key: number]: number };

    replays.forEach((replay) => {
        const bucket = Math.floor(replay.endRaceTime / binSize) * binSize;
        if (histogramBuckets[bucket] === undefined) {
            histogramBuckets[bucket] = 0;
        }
        histogramBuckets[bucket] += 1;
    });

    const histogramKeys = Object.keys(histogramBuckets).sort();
    const min = Math.min(...histogramKeys.map((key) => parseInt(key, 10)));
    const max = Math.max(...histogramKeys.map((key) => parseInt(key, 10)));

    const axisValues: number[] = [];
    for (let val = min; val <= max; val += binSize) {
        axisValues.push(val);
    }
    const histogramData = axisValues.map((key) => histogramBuckets[key] || 0);

    const columnOptions = {
        credits: {
            enabled: false,
        },
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            style: {
                color: 'white',
            },
        },
        title: {
            text: '',
        },
        subtitle: {
            text: '',
        },
        xAxis: {
            categories: axisValues.map((value) => getRaceTimeStr(value)),
            crosshair: true,
            labels: {
                style: {
                    color: 'white',
                },
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: '',
            },
            labels: {
                style: {
                    color: 'white',
                },
            },
            gridLineColor: '#333',
        },
        legend: {
            itemStyle: {
                color: 'white',
            },
        },
        tooltip: {
            // Highchart only accepts string tooltips, that's why this returns a HTML string
            formatter: function tooltipFormatter(this: any) {
                const { points } = this;

                if (points !== undefined && points.length < 1) {
                    return '';
                }

                const dataPoint = points[0];

                // Parse time format that doesn't always contain minutes: 50:43.849 or 43.849
                const split = dataPoint.key.split(':');
                let seconds = 0;
                let minutes = 0;
                let hours = 0;

                if (split.length === 1) {
                    seconds = parseFloat(split[0]);
                } else if (split.length === 2) {
                    minutes = parseFloat(split[0]);
                    seconds = parseFloat(split[1]);
                } else if (split.length === 3) {
                    hours = parseFloat(split[0]);
                    minutes = parseFloat(split[1]);
                    seconds = parseFloat(split[2]);
                }

                const raceTime = hours * 1000 * 60 * 60 + minutes * 1000 * 60 + seconds * 1000;

                return `
                    <span style="font-size: 10px">
                        ${getRaceTimeStr(raceTime)} - ${getRaceTimeStr(raceTime + binSize)}
                    </span>
                    </br>
                    <span style="font-size: 13px">
                        <b>
                            <span style=color:${dataPoint.series.color}>Replays: </span>
                            ${dataPoint.point.y}</b>
                    </span>
                `;
            },
            useHTML: true,
            shared: true,
        },
        plotOptions: {
            column: {
                pointPadding: 0,
                borderWidth: 0,
                groupPadding: 0,
                shadow: false,
            },
        },
        series: [{
            name: 'Finish Times',
            data: histogramData,

        }],
    };

    return (

        <HighchartsReact
            highcharts={Highcharts}
            options={columnOptions}
        />
    );
};

export default ReplayTimesHistogram;
