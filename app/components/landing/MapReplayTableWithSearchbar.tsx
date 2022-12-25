import React, { useMemo, useState } from 'react';
import {
    Input, Table, Tooltip, Button,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PieChartOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useQueryClient } from 'react-query';
import { timeDifference } from '../../lib/utils/time';
import CleanButton from '../common/CleanButton';
import { useAllMaps } from '../../lib/api/hooks/query/maps';
import { MapWithStats } from '../../lib/api/requests/maps';
import QUERY_KEYS from '../../lib/utils/reactQuery/reactQueryKeys';

interface ExtendedAvailableMap extends MapWithStats {
    key: string;
}

const MapReplayTableWithSearchbar = () => {
    const queryClient = useQueryClient();

    const [searchString, setSearchString] = useState<string>('');

    const { data: maps, isLoading, isFetching } = useAllMaps(searchString);

    const tableData: ExtendedAvailableMap[] | undefined = useMemo(
        () => maps?.map((map) => ({
            ...map,
            key: map.mapUId,
        })),
        [maps],
    );

    const columns: ColumnsType<ExtendedAvailableMap> = [
        {
            title: 'Map name',
            dataIndex: 'mapName',
            sorter: (a, b) => a.mapName.localeCompare(b.mapName),
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
                            <a href={mapRef} className="block p-2 w-full">{map.mapName}</a>
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
            dataIndex: 'lastUpdate',
            render: (timestamp) => {
                const today = new Date().getTime();
                return <span title={new Date(timestamp).toLocaleString()}>{timeDifference(today, timestamp)}</span>;
            },
            sorter: (a, b) => a.lastUpdate - b.lastUpdate,
            defaultSortOrder: 'descend',
            width: '15%',
        },
        {
            title: 'Replays',
            dataIndex: 'count',
            sorter: (a, b) => a.count - b.count,
            width: '15%',
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
                <Input.Search
                    className="rounded-md"
                    placeholder="Map name"
                    size="large"
                    allowClear
                    loading={isFetching}
                    onSearch={(value) => {
                        setSearchString(value);
                        queryClient.invalidateQueries(QUERY_KEYS.allMaps(value));
                    }}
                />
            </div>

            <Table
                className="overflow-x-auto select-none"
                columns={columns}
                dataSource={tableData}
                loading={isLoading}
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
                size="small"
                pagination={{
                    pageSize: 10,
                    hideOnSinglePage: true,
                    position: ['bottomCenter'],
                    showSizeChanger: false,
                    size: 'small',
                }}
            />
        </div>
    );
};

export default MapReplayTableWithSearchbar;
