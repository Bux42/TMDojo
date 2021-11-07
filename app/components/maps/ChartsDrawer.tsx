import React, {
    createRef,
    useContext, useEffect, useRef, useState,
} from 'react';
import {
    Button, Checkbox, Drawer,
} from 'antd';
import Highcharts, { AxisSetExtremesEventObject } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ReplayData } from '../../lib/api/apiRequests';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import { getRaceTimeStr } from '../../lib/utils/time';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import { ChartType, ChartTypes } from '../../lib/charts/chartTypes';
import { globalChartOptions } from '../../lib/charts/chartOptions';
import { metricChartData } from '../../lib/charts/chartData';

export interface RangeUpdateInfos {
    event: AxisSetExtremesEventObject,
    chartType: ChartType,
}

type ChartRefContent = {
    chart: Highcharts.Chart;
    container: React.RefObject<HTMLDivElement>;
}
type ChartRef = React.RefObject<ChartRefContent>

interface ReplayChartProps {
    chartRef: ChartRef,
    replaysData: ReplayData[];
    chartType: ChartType;
    allRaceTimes: number[];
    rangeUpdatedCallback: (rangeUpdateInfos: RangeUpdateInfos) => void;
    syncWithTimeLine: boolean;
}

let globalInterval: ReturnType<typeof setTimeout>;
let prevCurrentRacetime: number = 0;

export const ReplayChart = ({
    chartRef, replaysData, chartType: metric, allRaceTimes, rangeUpdatedCallback, syncWithTimeLine,
}: ReplayChartProps): JSX.Element => {
    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const replaySeries: any[] = [];
    replaysData.forEach((replay: ReplayData) => {
        if (metric.chartData.length > 1) {
            for (let i = 0; i < metric.chartData.length; i++) {
                const serie = metricChartData(replay, allRaceTimes, metric.chartData[i]);
                const serieTitle = metric.chartData[i].name;
                serie.name = `${replay.playerName} ${getRaceTimeStr(replay.endRaceTime)} ${serieTitle}`;

                if (i === 0) {
                    serie.yAxis = i + 1;
                }
                replaySeries.push(serie);
            }
        } else {
            const serie = metricChartData(replay, allRaceTimes, metric.chartData[0]);
            replaySeries.push(serie);
        }
    });

    const options: Highcharts.Options = globalChartOptions(
        metric.chartOptionsCallback(),
        replaysData,
        metric,
        replaySeries,
        rangeUpdatedCallback,
    );

    const highCharts = (
        <HighchartsReact
            ref={chartRef}
            constructorType="stockChart"
            highcharts={Highcharts}
            options={options}
        />
    );

    const hoverMarkerAtCurrentTime = (chart: any) => {
        chart.series.forEach((serie: any) => {
            for (let i = 0; i < serie.points.length; i++) {
                if (serie.points[i].category >= timeLineGlobal.currentRaceTime) {
                    serie.points[i].setState('hover');
                    break;
                }
            }
        });
    };

    clearInterval(globalInterval);

    if (syncWithTimeLine) {
        globalInterval = setInterval(() => {
            if (timeLineGlobal.isPlaying || prevCurrentRacetime !== timeLineGlobal.currentRaceTime) {
                prevCurrentRacetime = timeLineGlobal.currentRaceTime;
                let validCharts: boolean = false;
                highCharts.props.highcharts.charts.forEach((chart: any) => {
                    if (chart) {
                        validCharts = true;
                        hoverMarkerAtCurrentTime(chart);
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

    return (
        highCharts
    );
};

interface Props {
    replaysData: ReplayData[];
}

export const ChartsDrawer = ({
    replaysData,
}: Props): JSX.Element => {
    const [visible, setVisible] = useState<boolean>(false);
    const [syncWithTimeLine, setSyncWithTimeLine] = useState<boolean>(true);
    const [selectedChartTypes, setSelectedCharts] = useState<ChartType[]>([]);
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

    const chartRefs: ChartRef[] = selectedChartTypes.map(() => createRef<ChartRefContent>());

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
            let elBottomPos = 0;
            const elBottom = el1.style.bottom;
            if (typeof elBottom === 'string' && elBottom.endsWith('px')) {
                elBottomPos = parseInt(elBottom.replace('px', ''), 10);
            }
            const offsetBottom = document.body.offsetHeight - (e.clientY - document.body.offsetTop) - elBottomPos;
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
    });

    const toggleSyncCheckbox = (e: any) => {
        setSyncWithTimeLine(e.target.checked);
    };

    const onToggleCheckbox = (chartTypeKey: string, checked: boolean) => {
        const chartType = ChartTypes[chartTypeKey];
        if (chartType) {
            if (checked) {
                if (!selectedChartTypes.includes(chartType)) {
                    setSelectedCharts([...selectedChartTypes, chartType]);
                }
            } else {
                setSelectedCharts(selectedChartTypes.filter((x) => x.name !== chartType.name));
            }
        }
    };

    const changeAllChartRanges = (rangeUpdate: RangeUpdateInfos) => {
        chartRefs.forEach((chartRef: ChartRef, i) => {
            if (chartRef && typeof chartRef !== 'function' && chartRef.current) {
                if (chartRef.current.chart.xAxis) {
                    if (selectedChartTypes[i].name !== rangeUpdate.chartType.name) {
                        chartRef.current.chart.xAxis[0]
                            .setExtremes(rangeUpdate.event.min, rangeUpdate.event.max, true, false);
                    }
                }
            }
        });
    };

    const onRangeUpdated = (data: RangeUpdateInfos) => {
        changeAllChartRanges(data);
    };

    return (
        <div className="absolute right-0 left-0 bottom-0 m-8 mx-auto z-10" style={{ width: '50px' }}>
            {!visible
                && (
                    <Button
                        onClick={toggleSidebar}
                        size="large"
                        className="mb-8"
                    >
                        Charts
                    </Button>
                )}
            <Drawer
                mask={false}
                title="Charts"
                placement="bottom"
                onClose={onClose}
                visible={visible}
                height={512}
                bodyStyle={{
                    overflow: 'auto',
                }}
                style={{
                    bottom: '48px',
                    opacity: 0.8,
                }}
                className="ChartDrawer"
            >
                <div
                    style={{
                        position: 'absolute',
                        height: '12px',
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
                    <div className="flex justify-center pb-6">
                        {Object.keys(ChartTypes).map((chartType) => (
                            <Checkbox
                                style={{ textTransform: 'capitalize' }}
                                name={chartType}
                                key={chartType}
                                onChange={(e: CheckboxChangeEvent) => onToggleCheckbox(chartType, e.target.checked)}
                            >
                                {ChartTypes[chartType].name}
                            </Checkbox>
                        ))}
                    </div>
                    {selectedChartTypes.map((chartType, i) => (
                        <ReplayChart
                            chartRef={chartRefs[i]}
                            rangeUpdatedCallback={onRangeUpdated}
                            replaysData={replaysData}
                            chartType={chartType}
                            allRaceTimes={allRaceTimes}
                            key={chartType.name}
                            syncWithTimeLine={syncWithTimeLine}
                        />
                    ))}
                </div>
            </Drawer>
        </div>
    );
};
