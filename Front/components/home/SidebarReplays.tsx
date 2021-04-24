import React, { useState } from "react";
import { Button, Drawer, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { FileResponse } from "../../lib/api/fileRequests";
import { getEndRaceTimeStr, timeDifference } from "../../lib/utils/time";

interface Props {
    replays: FileResponse[];
    onLoadReplay: (replay: FileResponse) => void;
}

interface ExtendedFileResponse extends FileResponse {
    readableTime: string;
    relativeDate: string;
    finished: boolean;
}

export const SidebarReplays = ({ replays, onLoadReplay }: Props): JSX.Element => {
    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const getUniqueFilters = (replayFieldCallback: (replay: FileResponse) => string) => {
        const uniques = Array.from(new Set(replays.map(replayFieldCallback)));
        return uniques.sort().map((val) => {
            return { text: val, value: val };
        });
    };

    const columns: ColumnsType<ExtendedFileResponse> = [
        {
            title: "Map",
            dataIndex: "mapName",
            filters: getUniqueFilters((replay) => replay.mapName),
            onFilter: (value, record) => record.mapName === value,
            filterMultiple: false,
        },
        {
            title: "Player",
            dataIndex: "playerName",
            filters: getUniqueFilters((replay) => replay.playerName),
            onFilter: (value, record) => record.playerName === value,
        },
        {
            title: "Time",
            dataIndex: "readableTime",
            align: "right",
            width: 120,
            sorter: (a, b) => a.endRaceTime - b.endRaceTime,
        },
        {
            title: "Date",
            dataIndex: "relativeDate",
            align: "right",
            width: 120,
            sorter: (a, b) => a.date - b.date,
        },
        {
            title: "Finished",
            dataIndex: "finished",
            align: "center",
            width: 120,
            filters: [
                { text: "Yes", value: true },
                { text: "No", value: false },
            ],
            onFilter: (value, record) => record.finished === value,
            filterMultiple: false,
            render: (_, replay) => (
                <>
                    {replay.finished ? (
                        <div className="text-green-500">Yes</div>
                    ) : (
                        <div className="text-red-500">No</div>
                    )}
                </>
            ),
        },
        {
            title: "",
            key: "load",
            align: "center",
            width: 50,
            render: (_, replay) => (
                <Button size="middle" type="primary" onClick={() => onLoadReplay(replay)}>
                    Load
                </Button>
            ),
        },
    ];

    const addReplayInfo = (replayList: FileResponse[]): ExtendedFileResponse[] => {
        const now = new Date().getTime();

        return replayList.map((replay) => {
            return {
                ...replay,
                readableTime: getEndRaceTimeStr(replay.endRaceTime),
                relativeDate: timeDifference(now, replay.date),
                finished: replay.raceFinished == 1,
            };
        });
    };

    return (
        <div className="absolute m-8 z-10">
            <Button onClick={toggleSidebar} shape="round" size="large">
                Replay List
            </Button>
            <Drawer
                title="Select replays"
                placement="left"
                width={750}
                onClose={onClose}
                visible={visible}
                className={"h-screen"}
            >
                <div>
                    <Table
                        dataSource={addReplayInfo(replays)}
                        columns={columns}
                        size="small"
                        pagination={{ defaultPageSize: 25 }}
                        scroll={{ scrollToFirstRowOnChange: true, y: 675, x: "max-content" }}
                    />
                </div>
            </Drawer>
        </div>
    );
};
