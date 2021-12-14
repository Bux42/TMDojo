import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Layout, Input, Table, Tooltip, Button, Card, Spin,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PieChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { AvailableMap, getAvailableMaps } from '../lib/api/apiRequests';
import InfoCard from '../components/landing/InfoCard';
import { timeDifference } from '../lib/utils/time';

interface ExtendedAvailableMap extends AvailableMap {
    key: string;
}

const Home = (): JSX.Element => {
    const [maps, setMaps] = useState<ExtendedAvailableMap[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [searchString, setSearchString] = useState<string>('');

    const fetchMaps = async () => {
        setLoadingReplays(true);
        const fetchedMaps = await getAvailableMaps(searchString);
        const preparedMaps = fetchedMaps.map((fetchedMap) => ({
            ...fetchedMap,
            key: fetchedMap.mapUId,
        }));
        setMaps(preparedMaps);
        setLoadingReplays(false);
    };

    useEffect(() => {
        fetchMaps();
    }, [searchString]);

    const columns: ColumnsType<ExtendedAvailableMap> = [
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
                        <Spin spinning={loadingReplays}>

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
                                        onClick={fetchMaps}
                                    />
                                </Tooltip>
                            </div>

                            <Table
                                className="dojo-map-search-table"
                                dataSource={maps}
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
