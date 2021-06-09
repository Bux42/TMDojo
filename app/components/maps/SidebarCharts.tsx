import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Drawer, Table } from "antd";
import { ReplayDataPoint } from "../../lib/replays/replayData";
import { getEndRaceTimeStr } from "../../lib/utils/time";
import Highcharts, { isObject } from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { ReplayData } from "../../lib/api/apiRequests";

interface ReplayChartProps {
    replaysData: ReplayData[];
    metric: string;
    addChartFunc: any;
    callBack: any;
}

interface Props {
    replaysData: ReplayData[];
}

const readProp = (obj: any, prop: any) => obj[prop];

export const ReplayChart = ({ replaysData, metric, addChartFunc, callBack }: ReplayChartProps): JSX.Element => {
    const replaySeries: any[] = [];
    replaysData.forEach((replay: ReplayData) => {
        const replayData: any = [];
        replay.samples.forEach((sample: ReplayDataPoint) => {
            replayData.push([sample.currentRaceTime, read_prop(sample, metric)]);
        });
        replaySeries.push({
            name: `${replay.playerName} ${getEndRaceTimeStr(replay.endRaceTime)}`,
            data: replayData,
            marker: {
                enabled: null,
                radius: 3,
                lineWidth: 1,
                lineColor: '#FFFFFF',
            },
            tooltip: {
                valueDecimals: 3
            }
        })
    });
    const options = {
        chart: {
            height: 395,
        },
        rangeSelector: {
            enabled: false,
            inputEnabled: false,
            x: 0,
            verticalAlign: "top"
        },
        title: {
            text: metric,
        },
        xAxis: {
            events: {
                afterSetExtremes: function (event: any) {
                    callBack({
                        "Event": event,
                        "Metric": metric
                    });
                }
            },
            scrollbar: {
                enabled: true,
            },
            type: 'number',
            opposite: false,
        },
        yAxis: {
            type: "date",
        },
        series: replaySeries,
    };
    const highCharts = <HighchartsReact constructorType={"stockChart"} highcharts={Highcharts} options={options} />;
    addChartFunc(highCharts);
    return (
        highCharts
    )
}

// eslint-disable-next-line no-undef
let timer: NodeJS.Timeout;

const debounce = (callback: () => any, timeout: number) => () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        callback();
    }, timeout);
};

export const SidebarCharts = ({
    replaysData,
}: Props): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
    let childCharts: any[] = [];

    const addChart = (chart: any) => {
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
    });

    const toggleCheckbox = (e: any) => {
        if (e.target.checked) {
            if (!selectedCharts.includes(e.target.name)) {
                setSelectedCharts([...selectedCharts, e.target.name]);
            }
        } else {
            if (selectedCharts.includes(e.target.name)) {
                setSelectedCharts(selectedCharts.filter(x => x != e.target.name));
                childCharts = childCharts.filter(x => x.props.options.title.text != e.target.name);
            }
        }
    }

    const debounceChangeRange = (data: any) => {
        const myDebounce = debounce(function () {
            childCharts.forEach((chart: any) => {
                if (chart.props.options.title.text != data.Metric) {
                    chart.props.highcharts.charts.forEach((subChart: any) => {
                        if (subChart && subChart.xAxis) {
                            subChart.xAxis[0].setExtremes(data.Event.min, data.Event.max);
                        }
                    });
                }
            });
        }, 200);
        myDebounce();
    };
    
    const successCallBackData = (data: any) => {
        debounceChangeRange(data);
     }

    const replayCharts = selectedCharts.map(metric => (
        <ReplayChart addChartFunc={addChart} callBack={successCallBackData} replaysData={replaysData} metric={metric} key={metric}></ReplayChart>
    ));

    return (
        <div className="absolute right-0 left-0 bottom-0 m-8 mx-auto z-10" style={{ width: '50px' }}>
            <Button onClick={toggleSidebar} shape="round" size="large">
                Charts
            </Button>
            <Drawer
                mask={false}
                title="Charts"
                placement="bottom"
                onClose={onClose}
                visible={visible}
                height={256}
                bodyStyle={{
                    overflow: 'auto',
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
                        <Checkbox name="speed" onChange={toggleCheckbox}>Speed</Checkbox>
                        <Checkbox name="inputSteer" onChange={toggleCheckbox}>Inputs</Checkbox>
                        <Checkbox name="engineRpm" onChange={toggleCheckbox}>RPMs</Checkbox>
                    </div>
                    {replayCharts}
                </div>
            </Drawer>
        </div>
    );
};
