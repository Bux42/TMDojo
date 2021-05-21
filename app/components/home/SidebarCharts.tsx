import React, { useContext, useEffect, useState } from "react";
import { ReplayData } from "../../lib/api/fileRequests";
import { Button, Drawer, Table } from "antd";
import { ReplayDataPoint } from "../../lib/replays/replayData";
import { getEndRaceTimeStr } from "../../lib/utils/time";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts/highstock";
import GlobalObject, { GraphContext } from "../../lib/contexts/GraphContext";

interface Props {
    replaysData: ReplayData[];
}

export const ChartRange = ({ }): JSX.Element => {
    const { range, changeRange } = useContext(GraphContext);
    let interval: any;

    const setRange = () => {
        changeRange([GlobalObject.range[0], GlobalObject.range[1]]);
    };
    /*
    useEffect(() => {
        let interval = setInterval(function () {
            if (GlobalObject.lastUpdate) {
                if (Date.now() - GlobalObject.lastUpdate > 200 &&
                    GlobalObject.range.length > 0) {
                        if (GlobalObject.range[0] != range[0] || GlobalObject.range[1] != range[1]) {
                            setRange();
                        }
                    
                    //changeRange(GlobalObject.range);
                }
            }
        }, 200);
        return () => {
            clearInterval(interval);
        };
    }, []);
    */

    if (range.length) {
        return (
            <div><Button onClick={setRange}>
            setRange
        </Button>Start: {parseInt(range[0].toString())} End: {parseInt(range[1].toString())}</div>
            
        )
    } else {
        return (
            <div><Button onClick={setRange}>
            setRange
        </Button>No range</div>
        )
    }
}

export const SidebarCharts = ({
    replaysData
}: Props): JSX.Element => {
    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    let replaySeries: any[] = [];

    replaysData.forEach((replay: ReplayData) => {
        let replayData: any = [];
        replay.samples.forEach((sample: ReplayDataPoint) => {
            replayData.push([sample.currentRaceTime, sample.speed]);
        });
        let minimum = 50;
        let maximum = 255;

        let red = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        let green = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        let blue = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
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
    let dateNow = Date.now();
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
            text: "I am flash mqueen, I am speed"
        },
        xAxis: {
            events: {
                afterSetExtremes: function (event: any) {
                    GlobalObject.range = [event.min, event.max];
                    GlobalObject.lastUpdate = Date.now();
                }
            },
            minRange: 1,
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
    const { chartOptions, hoverData } = {
        chartOptions: options,
        hoverData: null
    };
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
                height={500}
            >
                <div>
                    <ChartRange></ChartRange>
                    <HighchartsReact constructorType={"stockChart"} highcharts={Highcharts} options={chartOptions} />
                </div>
            </Drawer>
        </div>
    )
};