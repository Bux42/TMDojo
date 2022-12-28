import React, {
    useState, useEffect, useContext, useMemo,
} from 'react';
import {
    Button, Drawer, Dropdown, Menu, message, Popconfirm, Space, Spin, Table, Tooltip,
} from 'antd';
import {
    DeleteOutlined,
    FilterFilled,
    QuestionCircleOutlined,
    ReloadOutlined, UnorderedListOutlined,
    ClockCircleOutlined,
    DownOutlined,
    TrophyFilled,
    ClockCircleFilled,
} from '@ant-design/icons';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { ColumnType, TableCurrentDataSource } from 'antd/lib/table/interface';
import { useQueryClient } from 'react-query';
import { getRaceTimeStr, timeDifference } from '../../lib/utils/time';
import { AuthContext } from '../../lib/contexts/AuthContext';
import SideDrawerExpandButton from '../common/SideDrawerExpandButton';
import PlayerLink from '../common/PlayerLink';
import { ReplayInfo } from '../../lib/api/requests/replays';
import CleanButton from '../common/CleanButton';
import useWindowDimensions from '../../lib/hooks/useWindowDimensions';
import {
    calcFastestSectorIndices,
    calcIndividualSectorTimes,
    calcValidSectorsLength,
    filterReplaysWithValidSectorTimes,
} from '../../lib/replays/sectorTimes';
import useDeleteReplayMutation from '../../lib/api/reactQuery/hooks/mutations/replays';

interface ExtendedReplayInfo extends ReplayInfo {
    readableTime: string;
    relativeDate: string;
    finished: boolean;
}

interface Props {
    mapUId: string;
    replays: ReplayInfo[];
    loadingReplays: boolean;
    fetchingReplays: boolean;
    onLoadReplay: (replay: ReplayInfo) => void;
    onRemoveReplay: (replay: ReplayInfo) => void;
    onLoadAllVisibleReplays: (replays: ReplayInfo[], selectedReplayDataIds: string[]) => void;
    onRemoveAllReplays: (replays: ReplayInfo[]) => void;
    onRefreshReplays: () => Promise<void>;
    selectedReplayDataIds: string[];
}

const SidebarReplays = ({
    mapUId,
    replays,
    loadingReplays,
    fetchingReplays,
    onLoadReplay,
    onRemoveReplay,
    onLoadAllVisibleReplays,
    onRemoveAllReplays,
    onRefreshReplays,
    selectedReplayDataIds,
}: Props): JSX.Element => {
    const queryClient = useQueryClient();
    const { mutate: deleteReplayMutation } = useDeleteReplayMutation(queryClient);

    const defaultPageSize = 14;

    const showFinishedColumn = replays.some((replay: ReplayInfo) => !replay.raceFinished);

    const [visible, setVisible] = useState(true);
    const [visibleReplays, setVisibleReplays] = useState<ReplayInfo[]>([]);
    const windowDimensions = useWindowDimensions();

    const { user } = useContext(AuthContext);

    const validSectorsLength = useMemo(
        () => calcValidSectorsLength(replays),
        [replays],
    );

    const userHasReplay = useMemo(
        () => {
            if (!user) {
                return false;
            }
            return replays.some(
                (replay) => replay.webId === user.accountId && replay.raceFinished,
            );
        },
        [replays, user],
    );

    const singleReplayHasSectorTimes = useMemo(
        () => replays.some((replay) => !!replay.sectorTimes && replay.sectorTimes.length === validSectorsLength),
        [replays, validSectorsLength],
    );

    useEffect(() => {
        // initialize visible replays with the first page
        const initiallyVisibleReplays = replays.slice(
            Math.max(replays.length - defaultPageSize, 0),
            replays.length,
        );
        setVisibleReplays(() => addReplayInfo(initiallyVisibleReplays));
    }, [replays]);

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const getUniqueFilters = (replayFieldCallback: (replay: ReplayInfo) => string) => {
        const uniques = Array.from(new Set(replays.map(replayFieldCallback)));
        return uniques.sort().map((val) => ({ text: val, value: val }));
    };

    const deleteReplay = async (replay: ExtendedReplayInfo) => {
        deleteReplayMutation(replay, {
            onSuccess: () => {
                message.success('Replay deleted');
            },
            onError: () => {
                message.error('Could not delete replay.');
            },
        });
    };

    const onLoadReplaysWithFastestSectorTimes = () => {
        // Filter finished replays containing sector times, sort by time
        const filteredReplays = filterReplaysWithValidSectorTimes(replays, replays)
            .sort((a, b) => a.endRaceTime - b.endRaceTime);

        if (filteredReplays.length === 0) {
            message.error('Did not find any finished replays with recorded sector times.');
            return;
        }

        // Calculate individual sector time deltas
        const allIndividualSectorTimes = filteredReplays
            .map((replay) => calcIndividualSectorTimes(replay.sectorTimes!, replay.endRaceTime));

        // Calculate the replay indices of all fastest sector times
        const fastestSectorIndices = calcFastestSectorIndices(allIndividualSectorTimes);

        // Get a unique set of replay indices
        const replayIndices = Array.from(new Set(fastestSectorIndices));

        // Load all fastest replays
        onLoadAllVisibleReplays(
            replayIndices.map((index) => filteredReplays[index]),
            selectedReplayDataIds,
        );
    };

    const onLoadFastestTime = () => {
        // Filter finished replays and sort by time
        const filteredReplays = replays
            .filter((replay) => replay.raceFinished)
            .sort((a, b) => a.endRaceTime - b.endRaceTime);

        if (filteredReplays.length === 0) {
            return;
        }

        onLoadReplay(filteredReplays[0]);
    };

    const onLoadUserPb = () => {
        if (!user) {
            message.error('User not logged in, could not find PB replay.');
            return;
        }

        // Filter finished replays and sort by time
        const filteredReplays = replays
            .filter((replay) => replay.webId === user.accountId)
            .filter((replay) => replay.raceFinished)
            .sort((a, b) => a.endRaceTime - b.endRaceTime);

        if (filteredReplays.length === 0) {
            message.error('No finished replay from user found on this map.');
            return;
        }

        onLoadReplay(filteredReplays[0]);
    };

    // TODO: add useMemo to filters and columns
    const nameFilters = getUniqueFilters((replay) => replay.playerName);
    nameFilters.sort((a, b) => {
        // If user is logged in, show the player filter on top:
        if (user && a.text === user?.displayName) return -1;
        if (user && b.text === user?.displayName) return 1;

        // Else, sort by name alphabetically:
        return a.text.toLowerCase() < b.text.toLowerCase() ? -1 : 1;
    });

    let columns: ColumnsType<ExtendedReplayInfo> = [
        {
            title: 'Player',
            dataIndex: 'playerName',
            filters: nameFilters,
            onFilter: (value, record) => record.playerName === value,
            render: (_, replay) => (
                <PlayerLink webId={replay.webId} name={replay.playerName} />
            ),
            filterSearch: true,
            filterIcon: () => (
                <div className="flex gap-1 items-center">
                    Filter
                    <FilterFilled />
                </div>
            ),
        },
        // TODO: Add back in when sector times are fixed on the server and plugin
        // {
        //     title: 'Sectors',
        //     dataIndex: 'sectorTime',
        //     align: 'center',
        //     width: 30,
        //     filters: [{ text: 'Includes sector times', value: true }],
        //     onFilter: (value, record) => !!record.sectorTimes === value,
        //     render: (_, replay) => {
        //         const validSectorTimes = replay.sectorTimes && replay.sectorTimes.length === validSectorsLength;

        //         return (
        //             <>
        //                 {validSectorTimes && (
        //                     <Tooltip title="Replay includes CP/sector times" placement="right">
        //                         <ClockCircleOutlined />
        //                     </Tooltip>
        //                 )}
        //             </>

        //         );
        //     }
        //     ,
        // },
        {
            title: 'Time',
            dataIndex: 'readableTime',
            align: 'right',
            width: 100,
            sorter: (a, b) => a.endRaceTime - b.endRaceTime,
        },
        {
            title: 'Date',
            dataIndex: 'relativeDate',
            align: 'right',
            width: 130,
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.date - b.date,
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
        {
            title: '',
            key: 'load',
            align: 'center',
            width: 150,
            render: (_, replay) => {
                const selected = selectedReplayDataIds.indexOf(replay._id) !== -1;
                return (
                    <div className="flex flex-row gap-4 items-center">
                        {!selected ? (
                            <CleanButton
                                onClick={() => onLoadReplay(replay)}
                                className="w-full"
                            >
                                Load
                            </CleanButton>
                        ) : (
                            <CleanButton
                                onClick={() => onRemoveReplay(replay)}
                                className="w-full"
                                backColor="#B41616"
                            >
                                Remove
                            </CleanButton>
                        )}
                        {user && user.accountId === replay.webId && (
                            <Popconfirm
                                title="Delete this replay?"
                                placement="right"
                                icon={(
                                    <QuestionCircleOutlined
                                        style={{ color: '#a61d24' }}
                                    />
                                )}
                                cancelText="No"
                                okText="Yes"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => deleteReplay(replay)}
                            >
                                <Button
                                    shape="circle"
                                    danger
                                    icon={<DeleteOutlined style={{ fontSize: '16px', color: '#a61d24' }} />}
                                />
                            </Popconfirm>
                        )}
                    </div>
                );
            },
        },
    ];

    if (!showFinishedColumn) {
        columns = columns.filter((column: ColumnType<ExtendedReplayInfo>) => column.dataIndex !== 'finished');
    }

    const addReplayInfo = (replayList: ReplayInfo[]): ExtendedReplayInfo[] => {
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
        currentPageData: TableCurrentDataSource<ExtendedReplayInfo>,
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

    return (
        <div className="absolute mt-12 z-10">
            <SideDrawerExpandButton
                onClick={toggleSidebar}
                side="left"
                content={(
                    <>
                        <UnorderedListOutlined className="mr-2" />
                        Replay List
                    </>
                )}
            />
            <Drawer
                title="Select replays"
                placement="left"
                width={Math.min(750, windowDimensions.width)}
                onClose={onClose}
                visible={visible}
                className="h-screen"
                headerStyle={{
                    backgroundColor: '#2C2C2C',
                }}
                bodyStyle={{
                    backgroundColor: '#1F1F1F',
                }}
            >
                <div className="flex flex-row justify-between items-center mb-3 mx-4">
                    <div className="flex flex-row gap-4">
                        {/* Load current page */}
                        <CleanButton
                            onClick={() => onLoadAllVisibleReplays(visibleReplays, selectedReplayDataIds)}
                        >
                            Load page
                        </CleanButton>

                        {/* Load other dropdown */}
                        <Dropdown
                            overlay={(
                                <Menu>
                                    <Menu.Item
                                        className="text-md"
                                        icon={<TrophyFilled />}
                                        onClick={() => onLoadFastestTime()}
                                    >
                                        Fastest Time
                                    </Menu.Item>
                                    <Menu.Item
                                        className="text-md"
                                        icon={<TrophyFilled />}
                                        onClick={() => onLoadUserPb()}
                                        disabled={!user || !userHasReplay}
                                    >
                                        Your PB
                                    </Menu.Item>
                                    {/* TODO: Add back in when sector times are fixed */}
                                    {/* <Menu.Item
                                            className="text-md"
                                            icon={<ClockCircleFilled />}
                                            onClick={() => onLoadReplaysWithFastestSectorTimes()}
                                            disabled={!singleReplayHasSectorTimes}
                                        >
                                            All replays containing fastest sectors
                                        </Menu.Item> */}
                                </Menu>
                            )}
                            mouseLeaveDelay={0.2}
                        >
                            <Space className="cursor-pointer">
                                <CleanButton
                                    onClick={() => { }}
                                    backColor="gray"
                                >
                                    Load other...
                                    <DownOutlined />
                                </CleanButton>
                            </Space>
                        </Dropdown>

                        {/* Unload all */}
                        <CleanButton
                            onClick={() => onRemoveAllReplays(visibleReplays)}
                            backColor="#B41616"
                        >
                            Unload all
                        </CleanButton>
                    </div>
                    <div className="mr-6">
                        <Tooltip title="Refresh">
                            <Button
                                shape="circle"
                                size="large"
                                icon={<ReloadOutlined spin={fetchingReplays} />}
                                onClick={onRefreshReplays}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div>
                    <Table
                        onChange={(pagination, filters, sorter, currentPageData) => {
                            onReplayTableChange(pagination, currentPageData);
                        }}
                        dataSource={addReplayInfo(replays)}
                        columns={columns}
                        size="small"
                        loading={loadingReplays}
                        pagination={{
                            pageSize: defaultPageSize,
                            hideOnSinglePage: true,
                            position: ['bottomCenter'],
                            showSizeChanger: false,
                            size: 'small',
                        }}
                        scroll={{ scrollToFirstRowOnChange: true }}
                    />
                </div>
            </Drawer>
        </div>
    );
};

export default SidebarReplays;
