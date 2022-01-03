// Disable this rule for highchart callback functions
/* eslint-disable react/no-this-in-sfc */

import React, { useMemo } from 'react';
import Highcharts, { some } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import dayjs from 'dayjs';
import { getRaceTimeStr, timeDifference } from '../../../lib/utils/time';
import { FileResponse } from '../../../lib/api/apiRequests';
import calculateFastestTimeProgressions from '../../../lib/utils/fastestTimeProgression';
import PlayerLink from '../../common/PlayerLink';
import { UserInfo } from '../../../lib/api/auth';

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

const replaysToProgressionDataPoints = (replays: FileResponse[]) => {
    const progression = calculateFastestTimeProgressions(replays);
    const dataPoints = replaysToDataPoints(progression);
    return dataPoints;
};

const filterReplaysByUser = (loggedInUser: UserInfo, inputReplays: FileResponse[]) => {
    const filtered = inputReplays.filter((r) => r.webId === loggedInUser.accountId);
    return filtered;
};

interface FastestTimeProgressionProps {
    replays: FileResponse[];
    onlyShowUserProgression: boolean;
    userToShowProgression?: UserInfo;
}
const FastestTimeProgression = ({
    replays,
    onlyShowUserProgression,
    userToShowProgression,
} : FastestTimeProgressionProps) => {
    const finishedReplays = useMemo(() => replays.filter((r) => r.raceFinished === 1), [replays]);

    const timeProgressionData: ChartDataPoint[] = useMemo(
        () => replaysToProgressionDataPoints(replays),
        [replays],
    );

    const personalTimeProgressionData: ChartDataPoint[] | undefined = useMemo(
        () => {
            if (userToShowProgression === undefined) {
                return undefined;
            }
            const filteredReplays = filterReplaysByUser(userToShowProgression, finishedReplays);
            return replaysToProgressionDataPoints(filteredReplays);
        },
        [userToShowProgression, finishedReplays],
    );

    const allDataPoints: ChartDataPoint[] = useMemo(
        () => {
            let filteredReplays = finishedReplays;

            filteredReplays = filteredReplays.filter(
                (r1) => !some(timeProgressionData, (r2: ChartDataPoint) => r1._id === r2.replay._id, null),
            );

            if (personalTimeProgressionData) {
                filteredReplays = filteredReplays.filter(
                    (r1) => !some(personalTimeProgressionData, (r2: ChartDataPoint) => r1._id === r2.replay._id, null),
                );
            }

            return replaysToDataPoints(filteredReplays);
        },
        [finishedReplays, timeProgressionData, personalTimeProgressionData],
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
            // Set timeProgressionData to undefined to disable the line when only showing user progression
            data: onlyShowUserProgression ? undefined : timeProgressionData,
            step: 'left',
            color: 'green',
        }, {
            type: 'line',
            name: 'Personal Best Times',
            data: personalTimeProgressionData,
            step: 'left',
            color: 'orange',
        }, {
            type: 'scatter',
            name: 'Other Times',
            data: allDataPoints,
            color: 'gray',
        }],
    };

    // Filter series for which the data is undefined
    options.series = options.series.filter((s) => s.data !== undefined);

    const allFastestTime = timeProgressionData && timeProgressionData.length > 0
        ? timeProgressionData[timeProgressionData.length - 1]
        : undefined;

    const personalFastestTime = personalTimeProgressionData !== undefined && personalTimeProgressionData.length > 0
        ? personalTimeProgressionData[personalTimeProgressionData.length - 1]
        : undefined;

    const fastestTime = allFastestTime || personalFastestTime;

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
