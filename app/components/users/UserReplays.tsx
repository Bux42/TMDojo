import {
    Card,
    Col,
    Row,
    Spin,
    Statistic,
    Table,
    TablePaginationConfig,
} from 'antd';
import { ColumnsType, TableCurrentDataSource } from 'antd/lib/table/interface';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FileResponse, getUserReplays, UserInfo } from '../../lib/api/apiRequests';
import { getRaceTimeStr, msToTime, timeDifference } from '../../lib/utils/time';

interface ExtendedFileResponse extends FileResponse {
    readableTime: string;
    relativeDate: string;
    finished: boolean;
}

interface Props {
    userInfo: UserInfo;
}

const UserReplays = ({ userInfo }: Props): JSX.Element => {
    const [userReplays, setUserReplays] = useState<FileResponse[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [visibleReplays, setVisibleReplays] = useState<FileResponse[]>([]);
    const defaultPageSize = 10;

    const fetchAndSetUserReplays = async (userId: string) => {
        setLoadingReplays(true);
        const { files } = await getUserReplays(userId);
        setUserReplays(files);
        setLoadingReplays(false);
    };

    const totalRecordedTime = userReplays.reduce((a, b) => a + b.endRaceTime, 0);
    const totalRecordedTimeStr = msToTime(totalRecordedTime);

    useEffect(() => {
        if (userInfo !== undefined && userInfo.webId) {
            fetchAndSetUserReplays(`${userInfo.webId}`);
        }
    }, []);

    const addReplayInfo = (replayList: FileResponse[]): ExtendedFileResponse[] => {
        const now = new Date().getTime();

        return replayList.map((replay) => ({
            ...replay,
            key: replay._id,
            readableTime: getRaceTimeStr(replay.endRaceTime),
            relativeDate: timeDifference(now, replay.date),
            finished: replay.raceFinished === 1,
        }));
    };

    const onReplayTableChange = (
        pagination: TablePaginationConfig,
        currentPageData: TableCurrentDataSource<ExtendedFileResponse>,
    ) => {
        const { current, pageSize } = pagination;

        if (current === undefined || pageSize === undefined) {
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

    const getUniqueFilters = (replayFieldCallback: (replay: FileResponse) => string) => {
        const uniques = Array.from(new Set(userReplays.map(replayFieldCallback)));
        return uniques.sort().map((val) => ({ text: val, value: val }));
    };

    const columns: ColumnsType<ExtendedFileResponse> = [
        {
            title: 'Map name',
            dataIndex: 'mapName',
            filters: getUniqueFilters((replay) => replay.mapName),
            onFilter: (value, record) => record.mapName === value,
            render: (_, map) => {
                const mapRef = `/maps/${map.mapUId}`;
                return (
                    <Link href={mapRef}>
                        <a href={mapRef}>{map.mapName}</a>
                    </Link>
                );
            },
        },
        {
            title: 'Time',
            dataIndex: 'readableTime',
            align: 'right',
            width: 120,
            sorter: (a, b) => a.endRaceTime - b.endRaceTime,
        },
        {
            title: 'Date',
            dataIndex: 'relativeDate',
            align: 'right',
            width: 120,
            sorter: (a, b) => a.date - b.date,
            defaultSortOrder: 'descend',
        },
        {
            title: 'Finished',
            dataIndex: 'finished',
            align: 'center',
            width: 120,
            filters: [
                { text: 'Yes', value: true },
                { text: 'No', value: false },
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
    ];

    return (
        <>
            <Spin spinning={loadingReplays}>
                <Card
                    title="Replays"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Statistic title="Count" value={userReplays ? userReplays.length : 0} />
                        </Col>
                        <Col span={12}>
                            <Statistic title="Total Time" value={totalRecordedTimeStr} />
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <Table
                        onChange={(pagination, filters, sorter, currentPageData) => {
                            onReplayTableChange(pagination, currentPageData);
                        }}
                        dataSource={addReplayInfo(userReplays)}
                        columns={columns}
                        size="small"
                        pagination={{
                            pageSize: defaultPageSize,
                            position: ['bottomCenter'],
                        }}
                        scroll={{ scrollToFirstRowOnChange: true }}
                    />
                </Card>
            </Spin>

        </>
    );
};

export default UserReplays;
