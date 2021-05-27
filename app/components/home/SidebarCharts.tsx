import React, { useContext, useEffect, useState } from "react";
import { ReplayData } from "../../lib/api/fileRequests";
import { Button, Checkbox, Drawer, Table } from "antd";
import { ReplayDataPoint } from "../../lib/replays/replayData";
import { getEndRaceTimeStr } from "../../lib/utils/time";
import HighchartsReact from "highcharts-react-official";
import Highcharts, { isObject } from "highcharts/highstock";
import { GraphContext } from "../../lib/contexts/GraphContext";

interface ReplayChartProps {
    replaysData: ReplayData[];
    metric: string
}

interface Props {
    replaysData: ReplayData[];
}

function read_prop(obj: any, prop: any) {
    return obj[prop];
}

export const ReplayChart = ({ replaysData, metric }: ReplayChartProps): JSX.Element => {
    const { range, changeRange } = useContext(GraphContext);
    let replaySeries: any[] = [];
    replaysData.forEach((replay: ReplayData) => {
        let replayData: any = [];
        replay.samples.forEach((sample: ReplayDataPoint) => {
            replayData.push([sample.currentRaceTime, read_prop(sample, metric)]);
        });
        replaySeries.push({
            name: replay.playerName + " " + getEndRaceTimeStr(replay.endRaceTime),
            data: replayData,
            marker: {
                enabled: null,
                radius: 3,
                lineWidth: 1,
                lineColor: "#FFFFFF"
            },
            tooltip: {
                valueDecimals: 2
            }
        })
    });
    let options = {
        chart: {
            height: 395
        },
        rangeSelector: {
            enabled: true,
            inputEnabled: true,
            x: 0,
            verticalAlign: "top",
            buttonPosition: {
                align: "left"
            },
            allButtonsEnabled: true,
            buttons: [
                {
                    type: "month",
                    count: 3,
                    text: "Day",
                    dataGrouping: {
                        forced: true,
                        units: [["day", [1]]]
                    }
                },
                {
                    type: "year",
                    count: 1,
                    text: "Week",
                    dataGrouping: {
                        forced: true,
                        units: [["week", [1]]]
                    }
                },
                {
                    type: "all",
                    text: "Month",
                    dataGrouping: {
                        forced: true,
                        units: [["month", [1]]]
                    }
                }
            ],
            buttonTheme: {
                width: 60
            },
        },
        title: {
            text: metric
        },
        xAxis: {
            min: (range.length > 0 ? range[0] : undefined),
            max: (range.length > 0 ? range[1] : undefined),
            events: {
                afterSetExtremes: function (event: any) {
                    debounceChangeRange([event.min, event.max]);
                }
            },
            scrollbar: {
                enabled: true
            },
            type: "number",
            opposite: false
        },
        yAxis: {
            //max: 300,
        },
        series: replaySeries
    };
    console.log(metric, "Re rendering, range:", range);
    const debounceChangeRange = (newRange: number[]) => {
        let myDebounce = debounce(function () {
            if (range[0] != newRange[0] || range[1] != newRange[1]) {
                console.log(metric, "changeRange, range:", range, ", newRange:", newRange);
                changeRange(newRange);
            }
        }, 200);
        myDebounce();
    };
    return (
        <HighchartsReact constructorType={"stockChart"} highcharts={Highcharts} options={options} />
    )
}

export const ChartRange = ({ }): JSX.Element => {
    const { range, changeRange } = useContext(GraphContext);

    return (
        <div>
            <div>
                Start: {parseInt(range[0]?.toString())} End: {parseInt(range[1]?.toString())}
            </div>
        </div>
    )
}

let timer: NodeJS.Timeout;

const debounce = (callback: () => any, timeout: number) => {
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, timeout);
    };
};

export const SidebarCharts = ({
    replaysData
}: Props): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

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
            let offsetBottom = document.body.offsetHeight - (e.clientY - document.body.offsetTop);
            const minHeight = 50;
            const maxHeight = 800;
            if (offsetBottom > minHeight && offsetBottom < maxHeight && el1) {
                el1.style.height = offsetBottom + "px";
            }
        }
    };

    useEffect(() => {
        el1 = document.querySelector('.ChartDrawer')

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
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
            }
        }
    }
    return (
        <div className="absolute right-0 left-0 bottom-0 mx-auto z-10" style={{ width: '50px' }}>
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
                    overflow: "auto"
                }}
                className="ChartDrawer"
            >
                <div
                    style={{
                        position: "absolute",
                        height: "5px",
                        padding: "4px 0 0",
                        right: 0,
                        top: 0,
                        left: 0,
                        zIndex: 100,
                        cursor: "ns-resize",
                        backgroundColor: "#f4f7f9"
                    }}
                    onMouseDown={onMouseDown}
                />
                <div>
                    <ChartRange></ChartRange>
                    <div>
                        <Checkbox name="speed" onChange={toggleCheckbox}>Speed</Checkbox>
                        <Checkbox name="inputSteer" onChange={toggleCheckbox}>Inputs</Checkbox>
                        <Checkbox name="engineRpm" onChange={toggleCheckbox}>RPMs</Checkbox>
                    </div>
                    {selectedCharts.map(metric => (
                        <ReplayChart replaysData={replaysData} metric={metric} key={metric}></ReplayChart>
                    ))}
                </div>
            </Drawer>
        </div>
    )
};