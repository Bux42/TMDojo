// Disable this rule for highchart callback functions
/* eslint-disable react/no-this-in-sfc */

import React, { useMemo } from 'react';
import Highcharts, { some } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import dayjs from 'dayjs';
import { getRaceTimeStr, timeDifference } from '../../../lib/utils/time';
import calculateFastestTimeProgressions from '../../../lib/utils/fastestTimeProgression';
import PlayerLink from '../../common/PlayerLink';
import { ReplayInfo } from '../../../lib/api/requests/replays';
import { AuthUserInfo } from '../../../lib/api/requests/auth';

interface ChartDataPoint {
    x: number;
    y: number;
    replay: ReplayInfo;
}

const replaysToDataPoints = (replays_: ReplayInfo[]): ChartDataPoint[] => replays_.map((replay) => ({
    x: replay.date,
    y: replay.endRaceTime,
    replay,
}));

const replaysToProgressionDataPoints = (replays: ReplayInfo[]) => {
    const progression = calculateFastestTimeProgressions(replays);
    const dataPoints = replaysToDataPoints(progression);
    return dataPoints;
};

const filterReplaysByUser = (loggedInUser: AuthUserInfo, inputReplays: ReplayInfo[]) => {
    const filtered = inputReplays.filter((r) => r.user.webId === loggedInUser.accountId);
    return filtered;
};

interface FastestTimeProgressionProps {
    replays: ReplayInfo[];
    onlyShowUserProgression: boolean;
    userToShowProgression?: AuthUserInfo;
}
const FastestTimeProgression = ({
    replays,
    onlyShowUserProgression,
    userToShowProgression,
}: FastestTimeProgressionProps) => {
    const finishedReplays = useMemo(() => replays.filter((r) => r.raceFinished === 1), [replays]);

    const timeProgressionData: ChartDataPoint[] = useMemo(
        () => replaysToProgressionDataPoints(replays).reverse(),
        [replays],
    );

    const personalTimeProgressionData: ChartDataPoint[] | undefined = useMemo(
        () => {
            if (userToShowProgression === undefined) {
                return undefined;
            }
            const filteredReplays = filterReplaysByUser(userToShowProgression, finishedReplays);
            return replaysToProgressionDataPoints(filteredReplays).reverse();
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
            zoomType: 'x',
        },
        title: {
            text: '',
        },
        subtitle: {
            text: '',
        },
        time: {
            useUTC: false,
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
                        ${dayjs(this.key).format('MMM D YYYY, HH:mm:ss')}
                    </span>
                    </br>
                    <span style="font-size: 13px">
                        ${timeDifference(new Date().getTime(), this.point.replay.date)}
                    </span>
                    </br>
                    <span style="font-size: 13px">
                        <b>${getRaceTimeStr(this.point.replay.endRaceTime)}</b>
                        ${' by '}
                        <b>${this.point.replay.user.playerName}</b>
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
                        return `${this.point.replay.user.playerName} - ${getRaceTimeStr(this.y)}`;
                    },
                    color: 'white',
                    shadow: false,
                    padding: 0,
                    y: 20,
                },
            },
            series: {
                turboThreshold: 0,
                animation: false,
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
            visible: false,
            color: 'gray',
            marker: {
                symbol: 'circle',
                radius: 2,
            },
        }],
    };

    // Filter series for which the data is undefined
    options.series = options.series.filter((s) => s.data !== undefined);

    const allFastestTime = timeProgressionData && timeProgressionData.length > 0
        ? timeProgressionData[0]
        : undefined;

    const personalFastestTime = personalTimeProgressionData !== undefined && personalTimeProgressionData.length > 0
        ? personalTimeProgressionData[0]
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
                        <PlayerLink webId={fastestTime.replay.user.webId} name={fastestTime.replay.user.playerName} />
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
