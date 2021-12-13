import React, { useMemo } from 'react';
import Highcharts, { some } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getRaceTimeStr } from '../../lib/utils/time';
import { FileResponse } from '../../lib/api/apiRequests';

interface FastestTimeProgressionProps {
    replays: FileResponse[];
}
const FastestTimeProgression = ({ replays } : FastestTimeProgressionProps) => {
    const calculateFastestTimeProgressions = (): FileResponse[] => {
        const fastestTimeProgressions: FileResponse[] = [];
        const sortedReplays = replays.sort((a, b) => a.date - b.date);

        fastestTimeProgressions.push(sortedReplays[0]);
        for (let i = 1; i < sortedReplays.length; i++) {
            const currentReplay = sortedReplays[i];
            const latestFastestReplay = fastestTimeProgressions[fastestTimeProgressions.length - 1];
            if (currentReplay.raceFinished
                && currentReplay.endRaceTime < latestFastestReplay.endRaceTime) {
                fastestTimeProgressions.push(currentReplay);
            }
        }
        return fastestTimeProgressions;
    };

    interface ChartDataPoint {
        x: number;
        y: number;
        replay: FileResponse;
    }

    const replaysToDataPoints = (replays_: FileResponse[]): ChartDataPoint[] => replays_.map((replay) => ({
        x: replay.date,
        y: replay.endRaceTime,
        replay,
    }));

    const timeProgressionData: ChartDataPoint[] = useMemo(
        () => replaysToDataPoints(calculateFastestTimeProgressions()),
        [replays],
    );

    const allDataPoints: ChartDataPoint[] = useMemo(
        () => replaysToDataPoints(
            replays.filter(
                (r1) => !some(timeProgressionData, (r2: FileResponse) => r1._id === r2._id, null),
            ),
        ),
        [replays, timeProgressionData],
    );

    const columnOptions = {
        credits: {
            enabled: false,
        },
        chart: {
            backgroundColor: 'transparent',
            style: {
                color: 'white',
            },
            zoomType: 'xy',
        },
        title: {
            text: '',
        },
        subtitle: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            crosshair: true,
            labels: {
                style: {
                    color: 'white',
                },
            },
        },
        yAxis: {
            title: {
                text: '',
            },
            labels: {
                style: {
                    color: 'white',
                },
                formatter: function yAxisLabelFormatter(this: any) {
                    // eslint-disable-next-line react/no-this-in-sfc
                    return getRaceTimeStr(this.value);
                },
            },
            gridLineColor: '#333',
        },
        legend: {
            itemStyle: {
                color: 'white',
                textDecoration: 'none',
            },
            itemHiddenStyle: {
                color: 'gray',
                textDecoration: 'line-through',
            },
            itemHoverStyle: {
                color: 'lightgray',
            },
        },
        tooltip: {
            headerFormat: '<span style="font-size:12px">Date: {point.key}</span><table>',
            pointFormat: '<tr>'
            + '<td style="color:{series.color};padding:0"><b>Time:</b></td>'
            + '<td style="padding:0 4px"><b>{point.y}ms</b></td></tr>'
            + '<tr>'
            + '<td style="color:{series.color};padding:0"><b>Player:</b></td>'
            + '<td style="padding:0 4px"><b>{point.replay.playerName}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function dataLabelFormatter(this: any) {
                        // eslint-disable-next-line react/no-this-in-sfc
                        return `[${this.point.replay.playerName}] ${getRaceTimeStr(this.y)}`;
                    },
                    color: 'white',
                    shadow: false,
                    allowOverlap: true,
                },
            },
        },
        series: [{
            type: 'line',
            name: 'Best Times',
            data: timeProgressionData,
            step: 'left',
        }, {
            type: 'scatter',
            name: 'Other Times',
            data: allDataPoints,
            color: 'gray',
        }],
    };

    return (

        <HighchartsReact
            highcharts={Highcharts}
            options={columnOptions}
        />
    );
};

export default FastestTimeProgression;
