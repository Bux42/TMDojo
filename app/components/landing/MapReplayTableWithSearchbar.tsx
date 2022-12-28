import React, { useMemo, useState } from 'react';
import { Input, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PieChartOutlined, SyncOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useQueryClient } from 'react-query';
import { timeDifference } from '../../lib/utils/time';
import CleanButton from '../common/CleanButton';
import { useAllMaps } from '../../lib/api/reactQuery/hooks/query/maps';
import { MapWithStats } from '../../lib/api/requests/maps';
import QUERY_KEYS from '../../lib/api/reactQuery/queryKeys';

interface ExtendedAvailableMap extends MapWithStats {
    key: string;
}

const MapReplayTableWithSearchbar = () => {
    const queryClient = useQueryClient();

    const [searchString, setSearchString] = useState<string>('');

    const { data: maps, isLoading, isFetching } = useAllMaps(searchString);

    const totalReplays = useMemo(() => {
        if (!maps) return 0;
        return maps.reduce((acc, map) => acc + map.count, 0);
    }, [maps]);

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
            render: (count) => count.toLocaleString(),
            sorter: (a, b) => a.count - b.count,
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
                    loading={isFetching}
                    onSearch={(value) => {
                        setSearchString(value);
                        queryClient.invalidateQueries(QUERY_KEYS.allMaps(value));
                    }}
                />

                <div className="flex flex-row w-full sm:w-1/2 justify-center sm:justify-start">
                    <Tag
                        className="text-base rounded"
                        icon={isLoading ? <SyncOutlined spin /> : null}
                    >
                        {`${(maps ? maps.length : 0).toLocaleString()} maps`}
                    </Tag>
                    <Tag
                        className="text-base rounded"
                        icon={isLoading ? <SyncOutlined spin /> : null}
                    >
                        {`${totalReplays.toLocaleString()} replays`}
                    </Tag>
                </div>
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
