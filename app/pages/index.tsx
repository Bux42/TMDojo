import React, { useState } from 'react';
import Link from 'next/link';
import {
    Input, Table, Tooltip, Button, Card, Spin,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PieChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from 'react-query';
import { Map } from '../lib/api/requests/maps';
import InfoCard from '../components/landing/InfoCard';
import { timeDifference } from '../lib/utils/time';
import { useAllMaps } from '../lib/api/hooks/query/maps';
import QUERY_KEYS from '../lib/utils/reactQuery/reactQueryKeys';

interface MapWithKey extends Map {
    key: string;
}

const Home = (): JSX.Element => {
    const [searchString, setSearchString] = useState<string>('');

    const queryClient = useQueryClient();
    const { data: allMaps, isLoading } = useAllMaps(searchString);

    const tableData: MapWithKey[] | undefined = allMaps?.map((map: Map) => ({
        ...map,
        key: map.mapUId,
    }));

    const columns: ColumnsType<MapWithKey> = [
        {
            title: 'Map name',
            dataIndex: 'mapName',
            render: (_, map) => {
                const mapRef = `/maps/${map.mapUId}`;
                return (
                    <Link href={mapRef}>
                        <a href={mapRef}>{map.mapName}</a>
                    </Link>
                );
            },
            sorter: (a, b) => a.mapName.localeCompare(b.mapName),
            width: '65%',
        },
        {
            title: '',
            render: (_, map) => {
                const statsRef = `/maps/${map.mapUId}/stats`;
                return (
                    <div className="flex gap-2 pr-2">
                        <Button href={statsRef} size="small" className="flex items-center">
                            <PieChartOutlined />
                            {' '}
                            Stats
                        </Button>
                    </div>
                );
            },
            width: 0,
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
            width: '20%',
        },
        {
            title: 'Replays',
            dataIndex: 'count',
            sorter: (a, b) => a.count - b.count,
            width: '15%',
        },
    ];

    return (
        <div className="flex flex-col items-center min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
            <div className="flex flex-col gap-6 w-3/5 h-full py-6">
                <InfoCard />
                <div className="w-full">
                    <Card>
                        <Spin spinning={isLoading}>
                            <div className="flex flex-row items-center mb-2 gap-4">
                                <Input.Search
                                    placeholder="Search for a map"
                                    onSearch={(searchVal) => setSearchString(searchVal)}
                                />
                                <Tooltip title="Refresh">
                                    <Button
                                        shape="circle"
                                        className="mr-2"
                                        icon={<ReloadOutlined />}
                                        onClick={() => queryClient.invalidateQueries(QUERY_KEYS.allMaps())}
                                    />
                                </Tooltip>
                            </div>

                            <Table
                                className="dojo-map-search-table"
                                dataSource={tableData}
                                columns={columns}
                                size="small"
                                showSorterTooltip={false}
                                pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}
                            />
                        </Spin>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Home;
