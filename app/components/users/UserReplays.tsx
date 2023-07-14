import React, { useMemo } from 'react';
import Link from 'next/link';
import {
    Card,
    Col,
    Row,
    Spin,
    Statistic,
    Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import { useUserReplays } from '../../lib/api/reactQuery/hooks/query/replays';
import { ReplayInfo } from '../../lib/api/requests/replays';
import { UserInfo } from '../../lib/api/requests/users';
import { getRaceTimeStr, msToTime, timeDifference } from '../../lib/utils/time';

const DEFAULT_PAGE_SIZE = 10;

interface ExtendedFileResponse extends ReplayInfo {
    readableTime: string;
    relativeDate: string;
    finished: boolean;
}

interface Props {
    userInfo: UserInfo;
}

const UserReplays = ({ userInfo }: Props): JSX.Element => {
    const {
        data: userReplaysResult,
        isLoading: isLoadingUserReplays,
    } = useUserReplays(userInfo.webId);

    const userReplays = useMemo(
        () => userReplaysResult?.replays || [],
        [userReplaysResult],
    );

    const dataSource = useMemo(() => {
        const now = new Date().getTime();

        return userReplays.map((replay) => ({
            ...replay,
            key: replay._id,
            readableTime: getRaceTimeStr(replay.endRaceTime),
            relativeDate: timeDifference(now, replay.date),
            finished: replay.raceFinished === 1,
        }));
    }, [userReplays]);

    const calculateTotalTime = (replays: ReplayInfo[]): string => {
        const totalRecordedTime = replays.reduce((a, b) => a + b.endRaceTime, 0);
        const totalRecordedTimeStr = msToTime(totalRecordedTime);
        return totalRecordedTimeStr;
    };

    const totalTime = useMemo(
        () => calculateTotalTime(userReplays),
        [userReplays],
    );

    const getUniqueFilters = (replayFieldCallback: (replay: ReplayInfo) => string) => {
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
            render: (_, entry) => {
                const mapRef = `/maps/${entry.mapUId}`;
                return (
                    <div className="w-full">
                        <Link href={mapRef}>
                            <a href={mapRef} className="block p-2 w-full">{entry.mapName}</a>
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
            <Spin spinning={isLoadingUserReplays}>
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
                                <Statistic title="Total Time" value={totalTime} />
                            </Col>
                        </Row>
                    </Card>
                    <Card
                        className="bg-gray-850"
                    >
                        <Table
                            dataSource={dataSource}
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
                                pageSize: DEFAULT_PAGE_SIZE,
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
