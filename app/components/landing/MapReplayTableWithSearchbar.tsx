import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
    const router = useRouter();

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

    const navigateToMap = (map: ExtendedAvailableMap) => {
        router.push(`/maps/${map.mapUId}`);
    };

    const columns: ColumnsType<ExtendedAvailableMap> = [
        {
            title: 'Map name',
            dataIndex: 'mapName',
            sorter: (a, b) => a.mapName.localeCompare(b.mapName),
            width: '60%',
        },
        {
            title: '',
            render: (_, map) => {
                const statsRef = `/maps/${map.mapUId}/stats`;
                return (
                    <div className="flex pr-2">
                        <CleanButton
                            size="small"
                            url={statsRef}
                            backColor="hsl(0, 0%, 15%)"
                            // Stop onClick propagation to avoid duplicate onClick events with Row onClick
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
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
        <Spin spinning={loadingReplays}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center gap-4">
                    <Input.Search
                        className="rounded-md"
                        placeholder="Search"
                        size="large"
                        onSearch={(searchVal) => setSearchString(searchVal)}
                        style={{ borderRadius: '10px' }}
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
                    className="overflow-x-scroll"
                    dataSource={maps}
                    columns={columns}
                    onHeaderRow={() => ({
                        style: {
                            backgroundColor: '#1F1F1F',
                            fontSize: '1rem',
                        },
                    })}
                    onRow={(map: ExtendedAvailableMap) => ({
                        style: {
                            backgroundColor: '#1F1F1F',
                            cursor: 'pointer',
                        },
                        onClick: () => {
                            navigateToMap(map);
                        },
                    })}
                    showSorterTooltip={false}
                    pagination={{
                        pageSize: 10,
                        hideOnSinglePage: true,
                        simple: true,
                        position: ['bottomCenter'],
                        showLessItems: true,
                    }}
                />
            </div>
        </Spin>
    );
};

export default MapReplayTableWithSearchbar;
