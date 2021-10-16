import React, { useContext, useEffect, useState } from 'react';
import {
    Button, Checkbox, Drawer,
} from 'antd';
import Highcharts, { AxisSetExtremesEventObject } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ReplayData } from '../../lib/api/apiRequests';
import {
    accelAndBrakeChartOptions, defaultChartOptions, inputSteerChartOptions, rpmsAndGearChartOptions,
} from '../../lib/charts/chartOptions';
import {
    engineCurrGearChartData,
    engineRPMsChartData,
    inputSteerChartData,
    speedChartData,
    inputGasPedalChartData,
    inputIsBrakingChartData,
    accelerationChartData,
} from '../../lib/charts/chartData';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import { getRaceTimeStr } from '../../lib/utils/time';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import GlobalChartsDataSingleton from '../../lib/singletons/globalChartData';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';

interface RangeUpdateInfos {
    Event: AxisSetExtremesEventObject,
    Metric: ChartType,
}

interface ReplayChartProps {
    replaysData: ReplayData[];
    metric: ChartType;
    addChartFunc: (chart: JSX.Element) => void;
    allRaceTimes: number[];
    rangeUpdatedCallback: (rangeUpdateInfos: RangeUpdateInfos) => void;
    syncWithTimeLine: boolean;
}

export interface ChartType {
    name: string;
    chartOptionsCallback: () => any;
    chartDataCallback: ((replay: ReplayData, allRaceTimes: number[]) => any)[];
}
export const ChartTypes: { [name: string]: ChartType } = {
    speed: {
        name: 'speed',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [speedChartData],
    },
    acceleration: {
        name: 'acceleration',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [accelerationChartData],
    },
    inputSteer: {
        name: 'inputSteer',
        chartOptionsCallback: inputSteerChartOptions,
        chartDataCallback: [inputSteerChartData],
    },
    engineRPMs: {
        name: 'engineRPMs',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [engineRPMsChartData],
    },
    engineCurrGear: {
        name: 'engineCurrGear',
        chartOptionsCallback: defaultChartOptions,
        chartDataCallback: [engineCurrGearChartData],
    },
    rpmsAndGear: {
        name: 'rpmsAndGear',
        chartOptionsCallback: rpmsAndGearChartOptions,
        chartDataCallback: [engineCurrGearChartData, engineRPMsChartData],
    },
    accelAndBrake: {
        name: 'accelAndBrake',
        chartOptionsCallback: accelAndBrakeChartOptions,
        chartDataCallback: [inputGasPedalChartData, inputIsBrakingChartData],
    },
};

let globalInterval: ReturnType<typeof setTimeout>;
let prevCurrentRacetime: number = 0;

export const ReplayChart = ({
    replaysData, metric, addChartFunc, allRaceTimes, rangeUpdatedCallback, syncWithTimeLine,
}: ReplayChartProps): JSX.Element => {
    const globalChartsData = GlobalChartsDataSingleton.getInstance();
    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const replaySeries: any[] = [];
    replaysData.forEach((replay: ReplayData) => {
        if (metric.chartDataCallback.length > 1) {
            for (let i = 0; i < metric.chartDataCallback.length; i++) {
                const serie = metric.chartDataCallback[i](replay, allRaceTimes);
                const serieTitle = metric.chartDataCallback[i].name.split('ChartData')[0];
                serie.name = `${replay.playerName} ${getRaceTimeStr(replay.endRaceTime)} ${serieTitle}`;

                if (i === 0) {
                    serie.yAxis = i + 1;
                }
                replaySeries.push(serie);
            }
        } else {
            const serie = metric.chartDataCallback[0](replay, allRaceTimes);
            replaySeries.push(serie);
        }
    });

    const options = metric.chartOptionsCallback();

    // Higchart tooltip needs more space when > 5 replays are loaded

    if (replaysData.length > 5) {
        options.chart.height += (replaysData.length - 5) * 34;
    }

    // give more space when > 1 tooltip per replay
    if (metric.chartDataCallback.length > 1) {
        options.chart.height += replaysData.length * 34;
    }

    options.title.text = metric.name;
    options.series = replaySeries;
    options.xAxis.events = {
        afterSetExtremes(event: AxisSetExtremesEventObject) {
            rangeUpdatedCallback({
                Event: event,
                Metric: metric,
            });
        },
    };
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

    const highCharts = <HighchartsReact constructorType="stockChart" highcharts={Highcharts} options={options} />;

    clearInterval(globalInterval);

    const getTooltipPoints = (chart: any): any[] => {
        const matchingPts: any[] = [];
        chart.series.forEach((serie: any) => {
            for (let i = 0; i < serie.points.length; i++) {
                if (serie.points[i].category >= timeLineGlobal.currentRaceTime) {
                    matchingPts.push(serie.points[i]);
                    serie.points[i].setState('hover');
                    break;
                }
            }
        });
        return matchingPts;
    };

    if (syncWithTimeLine) {
        globalInterval = setInterval(() => {
            if (timeLineGlobal.isPlaying || prevCurrentRacetime !== timeLineGlobal.currentRaceTime) {
                prevCurrentRacetime = timeLineGlobal.currentRaceTime;
                let validCharts: boolean = false;
                highCharts.props.highcharts.charts.forEach((chart: any) => {
                    if (chart) {
                        validCharts = true;
                        const matchingPts: any[] = getTooltipPoints(chart);
                        if (matchingPts.length) {
                            chart.tooltip.refresh(matchingPts);
                        }
                    }
                });
                if (!validCharts) {
                    clearInterval(globalInterval);
                }
            }
        }, 1);
    } else {
        clearInterval(globalInterval);
    }

    addChartFunc(highCharts);
    return (
        highCharts
    );
};

// eslint-disable-next-line no-undef
let timer: NodeJS.Timeout;

const debounce = (callback: () => any, timeout: number) => () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        callback();
    }, timeout);
};

interface Props {
    replaysData: ReplayData[];
}

export const ChartsDrawer = ({
    replaysData,
}: Props): JSX.Element => {
    const [visible, setVisible] = useState<boolean>(false);
    const [syncWithTimeLine, setSyncWithTimeLine] = useState<boolean>(true);
    const [selectedCharts, setSelectedCharts] = useState<ChartType[]>([]);
    const {
        numColorChange,
    } = useContext(SettingsContext);

    // Get each different currentRaceTime for all replays to get matching chart tooltips
    const allRaceTimes: number[] = [];

    replaysData.forEach((replay: ReplayData) => {
        replay.samples.forEach((sample: ReplayDataPoint) => {
            if (!allRaceTimes.includes(sample.currentRaceTime)) {
                allRaceTimes.push(sample.currentRaceTime);
            }
        });
    });
    allRaceTimes.sort((a, b) => a - b);

    let childCharts: JSX.Element[] = [];

    const addChart = (chart: JSX.Element) => {
        childCharts.push(chart);
    };

    let el1: any;
    let isResizing = false;

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const onMouseDown = (e: any) => {
        isResizing = true;
    };

    const onMouseUp = (e: any) => {
        isResizing = false;
    };

    const onMouseMove = (e: any) => {
        if (isResizing) {
            const offsetBottom = document.body.offsetHeight - (e.clientY - document.body.offsetTop);
            const minHeight = 50;
            const maxHeight = 800;
            if (offsetBottom > minHeight && offsetBottom < maxHeight && el1) {
                el1.style.height = `${offsetBottom}px`;
            }
        }
    };

    useEffect(() => {
        el1 = document.querySelector('.ChartDrawer');

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const toggleSyncCheckbox = (e: any) => {
        setSyncWithTimeLine(e.target.checked);
    };

    const toggleCheckbox = (e: any) => {
        if (e.target.checked) {
            if (!selectedCharts.includes(ChartTypes[e.target.name])) {
                setSelectedCharts([...selectedCharts, ChartTypes[e.target.name]]);
            }
        } else if (selectedCharts.includes(ChartTypes[e.target.name])) {
            setSelectedCharts(selectedCharts.filter((x) => x.name !== e.target.name));
            childCharts = childCharts.filter((x) => x.props.options.title.text !== e.target.name);
        }
    };

    const debounceChangeRange = (rangeUpdate: RangeUpdateInfos) => {
        const myDebounce = debounce(() => {
            childCharts.forEach((chart: JSX.Element) => {
                if (chart.props.options.title.text !== rangeUpdate.Metric) {
                    chart.props.highcharts.charts.forEach((subChart: any) => {
                        if (subChart && subChart.xAxis) {
                            subChart.xAxis[0].setExtremes(rangeUpdate.Event.min, rangeUpdate.Event.max);
                        }
                    });
                }
            });
        }, 200);
        myDebounce();
    };

    const successCallBackData = (data: any) => {
        debounceChangeRange(data);
    };
    const replayCharts = selectedCharts.map((metric) => (
        <ReplayChart
            addChartFunc={addChart}
            rangeUpdatedCallback={successCallBackData}
            replaysData={replaysData}
            metric={metric}
            allRaceTimes={allRaceTimes}
            key={metric.name}
            syncWithTimeLine={syncWithTimeLine}
        />
    ));
    return (
        <div className="absolute right-0 left-0 bottom-0 m-8 mx-auto z-10" style={{ width: '50px' }}>
            {!visible
                && (
                    <Button onClick={toggleSidebar} size="large" className="mb-1">
                        Charts
                    </Button>
                )}
            <Drawer
                mask={false}
                title={(
                    <div>
                        Charts
                        <Checkbox
                            style={{ marginLeft: '15px' }}
                            onChange={toggleSyncCheckbox}
                            checked={syncWithTimeLine}
                        >
                            Sync with timeline
                        </Checkbox>
                    </div>

                )}
                placement="bottom"
                onClose={onClose}
                visible={visible}
                height={512}
                bodyStyle={{
                    overflow: 'auto',
                }}
                style={{
                    bottom: '34px',
                    opacity: 0.8,
                }}
                className="ChartDrawer"
            >
                <div
                    style={{
                        position: 'absolute',
                        height: '5px',
                        padding: '4px 0 0',
                        right: 0,
                        top: 0,
                        left: 0,
                        zIndex: 100,
                        cursor: 'ns-resize',
                    }}
                    onMouseDown={onMouseDown}
                    aria-hidden="true"
                />
                <div>
                    <div>
                        {Object.keys(ChartTypes).map((chartType) => (
                            <Checkbox
                                style={{ textTransform: 'capitalize' }}
                                name={chartType}
                                key={chartType}
                                onChange={toggleCheckbox}
                            >
                                {chartType}
                            </Checkbox>
                        ))}
                    </div>
                    {replayCharts}
                </div>
            </Drawer>
        </div>
    );
};
