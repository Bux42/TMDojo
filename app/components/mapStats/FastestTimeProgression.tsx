import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
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
    }

    const data: ChartDataPoint[] = useMemo(
        () => calculateFastestTimeProgressions().map((replay) => ({
            x: replay.date,
            y: replay.endRaceTime,
            player: replay.playerName,
        })),
        [replays],
    );

    const columnOptions = {
        credits: {
            enabled: false,
        },
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            style: {
                color: 'white',
            },
            zoomType: 'x',
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
            },
        },
        tooltip: {
            headerFormat: '<span style="font-size:12px">{point.key}</span><table>',
            pointFormat: '<tr>'
            + '<td style="color:{series.color};padding:0"><b>{series.name}: </b></td>'
            + '<td style="padding:0"><b>{point.y}ms</b></td></tr>'
            + '<tr>'
            + '<td style="color:{series.color};padding:0"><b>Player: </b></td>'
            + '<td style="padding:0"><b>{point.player}ms</b></td></tr>',
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
                        return `[${this.point.player}] ${getRaceTimeStr(this.y)}`;
                    },
                    color: 'white',
                    shadow: false,
                    allowOverlap: true,
                },
            },
        },
        series: [{
            name: 'Time',
            data,
            step: 'left',
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
