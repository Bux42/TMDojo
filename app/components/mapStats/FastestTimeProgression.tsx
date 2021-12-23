// Disable this rule for highchart callback functions
/* eslint-disable react/no-this-in-sfc */

import React, { useMemo } from 'react';
import Highcharts, { some } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import dayjs from 'dayjs';
import { getRaceTimeStr, timeDifference } from '../../lib/utils/time';
import { FileResponse } from '../../lib/api/apiRequests';
import PlayerLink from '../common/PlayerLink';

interface FastestTimeProgressionProps {
    replays: FileResponse[];
}
const FastestTimeProgression = ({ replays } : FastestTimeProgressionProps) => {
    const calculateFastestTimeProgressions = (replayList: FileResponse[]): FileResponse[] => {
        if (replayList.length === 0) {
            return [];
        }

        const fastestTimeProgressions: FileResponse[] = [];
        const sortedReplays = replayList.sort((a, b) => a.date - b.date);

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

    const fastestTimeProgressions = useMemo(() => calculateFastestTimeProgressions(replays), [replays]);

    const replaysToDataPoints = (replays_: FileResponse[]): ChartDataPoint[] => replays_.map((replay) => ({
        x: replay.date,
        y: replay.endRaceTime,
        replay,
    }));

    const timeProgressionData: ChartDataPoint[] = useMemo(
        () => replaysToDataPoints(fastestTimeProgressions),
        [fastestTimeProgressions],
    );

    const allDataPoints: ChartDataPoint[] = useMemo(
        () => replaysToDataPoints(
            replays.filter(
                (r1) => !some(timeProgressionData, (r2: ChartDataPoint) => r1._id === r2.replay._id, null),
            ),
        ),
        [replays, timeProgressionData],
    );

    const options = {
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
            title: {
                text: 'Date',
            },
            crosshair: true,
            labels: {
                style: {
                    color: 'white',
                },
            },
        },
        yAxis: {
            title: {
                text: 'Time',
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
            // Highchart only accepts string tooltips, that's why this returns a HTML string
            formatter: function tooltipFormatter(this: any) {
                return `
                    <span style="font-size: 10px">
                        ${dayjs(this.key).format('MMM D YYYY, HH:MM:ss')}
                    </span>
                    </br>
                    <span style="font-size: 13px">
                        ${timeDifference(new Date().getTime(), this.point.replay.date)}
                    </span>
                    </br>
                    <span style="font-size: 13px">
                        <b>${getRaceTimeStr(this.point.replay.endRaceTime)}</b>
                        ${' by '}
                        <b>${this.point.replay.playerName}</b>
                    </span>
                `;
            },
            useHTML: true,
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function dataLabelFormatter(this: any) {
                        // eslint-disable-next-line react/no-this-in-sfc
                        return `${this.point.replay.playerName} - ${getRaceTimeStr(this.y)}`;
                    },
                    color: 'white',
                    shadow: false,
                    allowOverlap: true,
                    y: 25,
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

    const fastestTime = timeProgressionData.length > 0
        ? timeProgressionData[timeProgressionData.length - 1]
        : undefined;

    return (
        fastestTime ? (
            <>
                <div className="flex flex-col items-center w-full mb-6">
                    <div className="text-xs italic mb-4">
                        Note: All these times are from TMDojo data only.
                        It does not represent a WR progression, but a progression of the best times stored on TMDojo.
                    </div>
                    <div><b>Fastest Time</b></div>
                    <div className="text-xl mb-1">
                        {getRaceTimeStr(fastestTime.replay.endRaceTime)}
                        {' by '}
                        <PlayerLink webId={fastestTime.replay.webId} name={fastestTime.replay.playerName} />
                    </div>
                    <div className="text-xs">{timeDifference(new Date().getTime(), fastestTime.replay.date)}</div>
                </div>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                />
            </>
        ) : null
    );
};

export default FastestTimeProgression;
