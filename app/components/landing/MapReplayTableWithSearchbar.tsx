import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Input, Table, Tooltip, Button, Spin,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PieChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { AvailableMap, getAvailableMaps } from '../../lib/api/apiRequests';
import { timeDifference } from '../../lib/utils/time';
import CleanButton from '../common/CleanButton';

interface ExtendedAvailableMap extends AvailableMap {
    key: string;
}

const MapReplayTableWithSearchbar = () => {
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
                    <div className="flex pr-2">
                        <CleanButton size="small" url={statsRef} color="#1857B7">
                            <div className="flex gap-2 items-center">
                                <PieChartOutlined />
                                Stats
                            </div>
                        </CleanButton>
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

        <Spin spinning={loadingReplays}>

            <div className="flex flex-row items-center mb-2 gap-4">
                <Input.Search
                    className="rounded-md"
                    placeholder="Search"
                    size="large"
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
                className="dojo-map-search-table rounded-md"
                dataSource={maps}
                columns={columns}
                onHeaderRow={() => ({ style: { fontSize: '16px' } })}
                showSorterTooltip={false}
                pagination={{
                    pageSize: 10,
                    hideOnSinglePage: true,
                    simple: true,
                    position: ['bottomCenter'],
                    showLessItems: true,
                }}
            />
        </Spin>
    );
};

export default MapReplayTableWithSearchbar;
