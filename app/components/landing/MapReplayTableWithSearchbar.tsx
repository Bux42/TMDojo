import React, { useMemo, useState } from 'react';
import { Input, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PieChartOutlined, SyncOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { timeDifference } from '../../lib/utils/time';
import CleanButton from '../common/CleanButton';
import {
    useAllMaps,
    useMapCount,
    useReplayCount,
} from '../../lib/api/reactQuery/hooks/query/maps';
import {
    MapSortBy,
    MapSortOrder,
    MapWithStats,
} from '../../lib/api/requests/maps';
import QUERY_KEYS from '../../lib/api/reactQuery/queryKeys';

interface ExtendedAvailableMap extends MapWithStats {
    key: string;
}

const PAGE_SIZE = 10;

const MapReplayTableWithSearchbar = () => {
    const queryClient = useQueryClient();

    const [searchString, setSearchString] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<MapSortBy>('last_updated');
    const [sortOrder, setSortOrder] = useState<MapSortOrder>('desc');

    const offset = (page - 1) * PAGE_SIZE;

    const {
        data: maps,
        isLoading,
        isFetching,
    } = useAllMaps(searchString, offset, PAGE_SIZE, sortBy, sortOrder);
    const isMapsQueryPending = isLoading || isFetching;
    const { data: totalMaps, isLoading: isLoadingMapCount } =
        useMapCount(searchString);
    const { data: totalReplays, isLoading: isLoadingReplayCount } =
        useReplayCount();

    const tableData: ExtendedAvailableMap[] | undefined = useMemo(
        () =>
            maps?.map((map) => ({
                ...map,
                key: map.mapUId,
            })),
        [maps],
    );

    const currentAntSortOrder: 'ascend' | 'descend' =
        sortOrder === 'asc' ? 'ascend' : 'descend';

    const columns: ColumnsType<ExtendedAvailableMap> = [
        {
            title: 'Map name',
            key: 'map_name',
            dataIndex: 'mapName',
            sorter: true,
            sortDirections: ['descend', 'ascend'],
            sortOrder: sortBy === 'map_name' ? currentAntSortOrder : null,
            width: '60%',
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
                            <a
                                href={mapRef}
                                className={`block p-2 w-full ${
                                    isMapsQueryPending
                                        ? 'pointer-events-none opacity-70'
                                        : ''
                                }`}
                            >
                                {map.mapName}
                            </a>
                        </Link>
                    </div>
                );
            },
        },
        {
            title: '',
            render: (_, map) => {
                const statsRef = `/maps/${map.mapUId}/stats`;
                return (
                    <div className="flex justify-center pr-2">
                        <CleanButton
                            size="small"
                            url={statsRef}
                            backColor="hsl(0, 0%, 9%)"
                            disabled={isMapsQueryPending}
                        >
                            <div className="flex gap-2 items-center">
                                <PieChartOutlined />
                                Stats
                            </div>
                        </CleanButton>
                    </div>
                );
            },
            width: '10%',
        },
        {
            title: 'Last updated',
            key: 'last_updated',
            dataIndex: 'lastUpdate',
            render: (timestamp) => {
                const today = new Date().getTime();
                return (
                    <span title={new Date(timestamp).toLocaleString()}>
                        {timeDifference(today, timestamp)}
                    </span>
                );
            },
            sorter: true,
            sortDirections: ['descend', 'ascend'],
            sortOrder: sortBy === 'last_updated' ? currentAntSortOrder : null,
            width: '15%',
        },
        {
            title: 'Replays',
            key: 'replay_count',
            dataIndex: 'count',
            render: (count) => count.toLocaleString(),
            sorter: true,
            sortDirections: ['descend', 'ascend'],
            sortOrder: sortBy === 'replay_count' ? currentAntSortOrder : null,
            width: '15%',
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row place-self-center justify-center items-center gap-4 w-full">
                <Input.Search
                    className="w-full sm:w-1/2 bg-gray-800"
                    placeholder="Map name"
                    size="large"
                    allowClear
                    loading={isMapsQueryPending}
                    disabled={isMapsQueryPending}
                    onSearch={(value) => {
                        setSearchString(value);
                        setPage(1);
                        queryClient.invalidateQueries(
                            QUERY_KEYS.allMaps(
                                value,
                                0,
                                PAGE_SIZE,
                                sortBy,
                                sortOrder,
                            ),
                        );
                        queryClient.invalidateQueries(
                            QUERY_KEYS.mapCount(value),
                        );
                    }}
                />

                <div className="flex flex-row w-full sm:w-1/2 justify-center sm:justify-start">
                    <Tag
                        className="text-base rounded"
                        icon={isLoadingMapCount ? <SyncOutlined spin /> : null}
                    >
                        {`${(totalMaps ?? 0).toLocaleString()} maps`}
                    </Tag>
                    <Tag
                        className="text-base rounded"
                        icon={
                            isLoadingReplayCount ? <SyncOutlined spin /> : null
                        }
                    >
                        {`${(totalReplays ?? 0).toLocaleString()} replays`}
                    </Tag>
                </div>
            </div>

            <Table
                className={`overflow-x-auto select-none ${isMapsQueryPending ? 'pointer-events-none' : ''}`}
                columns={columns}
                dataSource={tableData}
                loading={isMapsQueryPending}
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
                onChange={(pagination, _, sorter) => {
                    const currentSorter = Array.isArray(sorter)
                        ? sorter[0]
                        : sorter;

                    const columnSortBy = currentSorter?.columnKey as
                        | MapSortBy
                        | undefined;
                    const columnSortOrder = currentSorter?.order as
                        | 'ascend'
                        | 'descend'
                        | undefined;

                    if (!columnSortBy) {
                        setSortBy('last_updated');
                        setSortOrder('desc');
                    } else {
                        const newSortBy = columnSortBy;
                        let newSortOrder: MapSortOrder;
                        if (columnSortOrder === 'ascend') {
                            newSortOrder = 'asc';
                        } else if (columnSortOrder === 'descend') {
                            newSortOrder = 'desc';
                        } else if (
                            newSortBy === sortBy &&
                            sortOrder === 'desc'
                        ) {
                            newSortOrder = 'asc';
                        } else {
                            newSortOrder = 'desc';
                        }
                        const sortChanged =
                            newSortBy !== sortBy || newSortOrder !== sortOrder;
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                        if (sortChanged) {
                            setPage(1);
                            return;
                        }
                    }

                    setPage(pagination.current ?? 1);
                }}
                size="small"
                pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: totalMaps ?? 0,
                    position: ['bottomCenter'],
                    showSizeChanger: false,
                    size: 'small',
                }}
            />
        </div>
    );
};

export default MapReplayTableWithSearchbar;
