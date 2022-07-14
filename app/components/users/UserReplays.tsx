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
    }, [userInfo]);

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
            onCell: () => ({
                style: {
                    padding: 0,
                },
            }),
            render: (_, map) => {
                const mapRef = `/maps/${map.mapUId}`;
                return (
                    <div className="w-full">
                        <Link href={mapRef}>
                            <a href={mapRef} className="block p-2 w-full">{map.mapName}</a>
                        </Link>
                    </div>
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
                <div className="flex flex-col w-full gap-6">
                    <Card
                        title="Replays"
                        className="bg-gray-850"
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
                    <Card
                        className="bg-gray-850"
                    >
                        <Table
                            onChange={(pagination, filters, sorter, currentPageData) => {
                                onReplayTableChange(pagination, currentPageData);
                            }}
                            dataSource={addReplayInfo(userReplays)}
                            columns={columns}
                            size="small"
                            onHeaderRow={() => ({
                                style: {
                                    backgroundColor: '#1F1F1F',
                                    fontSize: '1rem',
                                },
                            })}
                            onRow={() => ({
                                style: {
                                    backgroundColor: '#1F1F1F',
                                },
                            })}
                            pagination={{
                                pageSize: 10,
                                hideOnSinglePage: true,
                                position: ['bottomCenter'],
                                showLessItems: true,
                                showSizeChanger: false,
                                size: 'small',
                            }}
                            scroll={{ scrollToFirstRowOnChange: true }}
                        />
                    </Card>

                </div>
            </Spin>

        </>
    );
};

export default UserReplays;
