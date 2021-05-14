import React, { useState } from "react";
import { Button, Drawer, Table } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { FileResponse } from "../../lib/api/fileRequests";
import { getEndRaceTimeStr, timeDifference } from "../../lib/utils/time";
import { TableCurrentDataSource } from "antd/lib/table/interface";

interface Props {
    replays: FileResponse[];
    onLoadReplay: (replay: FileResponse) => void;
    onRemoveReplay: (replay: FileResponse) => void;
    onLoadAllVisibleReplays: (replays: FileResponse[], selectedReplayDataIds: string[]) => void;
    onRemoveAllReplays: (replays: FileResponse[]) => void;
    selectedReplayDataIds: string[];
}

interface ExtendedFileResponse extends FileResponse {
    readableTime: string;
    relativeDate: string;
    finished: boolean;
}

export const SidebarReplays = ({
    replays,
    onLoadReplay,
    onRemoveReplay,
    onLoadAllVisibleReplays,
    onRemoveAllReplays,
    selectedReplayDataIds,
}: Props): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [visibleReplays, setVisibleReplays] = useState<FileResponse[]>([]);

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
            width: 80,
            render: (_, replay) => {
                const selected = selectedReplayDataIds.indexOf(replay._id) != -1;
                return !selected ? (
                    <Button
                        size="middle"
                        type="primary"
                        onClick={() => onLoadReplay(replay)}
                        className={"w-full"}
                    >
                        Load
                    </Button>
                ) : (
                    <Button
                        size="middle"
                        type="primary"
                        danger
                        className={"w-full"}
                        onClick={() => onRemoveReplay(replay)}
                    >
                        Remove
                    </Button>
                );
            },
        },
    ];

    const addReplayInfo = (replayList: FileResponse[]): ExtendedFileResponse[] => {
        const now = new Date().getTime();

        return replayList.map((replay) => {
            return {
                ...replay,
                key: replay._id,
                readableTime: getEndRaceTimeStr(replay.endRaceTime),
                relativeDate: timeDifference(now, replay.date),
                finished: replay.raceFinished == 1,
            };
        });
    };

    const onReplayTableChange = (
        pagination: TablePaginationConfig,
        currentPageData: TableCurrentDataSource<ExtendedFileResponse>
    ) => {
        const { current, pageSize } = pagination;

        if (current == undefined || pageSize == undefined) {
            return;
        }

        const curPageIndex = current - 1;

        const replaysOnPage = [];
        for (
            let i = curPageIndex * pageSize;
            i < Math.min((curPageIndex + 1) * pageSize, currentPageData.currentDataSource.length);
            i++
        ) {
            replaysOnPage.push(currentPageData.currentDataSource[i]);
        }

        setVisibleReplays(replaysOnPage);
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
                    <Button
                        type="primary"
                        onClick={() =>
                            onLoadAllVisibleReplays(visibleReplays, selectedReplayDataIds)
                        }
                    >
                        Load all visible
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => onRemoveAllReplays(visibleReplays)}
                    >
                        Unload all
                    </Button>
                </div>
                <div>
                    <Table
                        onChange={(pagination, filters, sorter, currentPageData) => {
                            onReplayTableChange(pagination, currentPageData);
                        }}
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
