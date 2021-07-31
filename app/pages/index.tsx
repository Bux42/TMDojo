import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Layout, Input, Table, Tooltip, Button, Card,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { AvailableMap, getAvailableMaps } from '../lib/api/apiRequests';
import InfoCard from '../components/landing/InfoCard';
import { timeDifference } from '../lib/utils/time';

// eslint-disable-next-line max-len
const MAP_THUMBNAIL_PLACEHOLDER_URL = 'https://prod.trackmania.core.nadeo.online/storageObjects/8c5af573-976b-42ca-8920-2f78a658f92f.jpg';

interface ExtendedAvailableMap extends AvailableMap {
    key: string;
}

const Home = (): JSX.Element => {
    const [maps, setMaps] = useState<ExtendedAvailableMap[]>([]);
    const [searchString, setSearchString] = useState<string>('');
    const router = useRouter();

    const fetchMaps = async () => {
        const fetchedMaps = await getAvailableMaps(searchString);
        const preparedMaps = fetchedMaps.map((fetchedMap) => ({
            ...fetchedMap,
            key: fetchedMap.mapUId,
        }));
        setMaps(preparedMaps);
    };

    useEffect(() => {
        fetchMaps();
    }, [searchString]);

    const columns: ColumnsType<ExtendedAvailableMap> = [
        {
            title: 'Map',
            dataIndex: 'mapName',
            render: (_, map) => {
                const mapRef = `/maps/${map.mapUId}`;
                return (
                    <div className="flex flex-row gap-4 items-center">
                        <img
                            src={MAP_THUMBNAIL_PLACEHOLDER_URL}
                            alt="Thumbnail"
                            width={38}
                            height={38}
                        />
                        <Link href={mapRef}>
                            <a href={mapRef}>{map.mapName}</a>
                        </Link>
                    </div>
                );
            },
            sorter: (a, b) => a.mapName.localeCompare(b.mapName),
            width: '65%',
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
        <Layout>
            <Layout.Content className="w-3/5 m-auto h-full flex flex-col pt-8">
                <InfoCard />
                <Card className="mt-8">
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
                        bordered
                        onRow={(record, rowIndex) => ({
                            onClick: () => {
                                const mapRef = `/maps/${record.mapUId}`;
                                router.push(`/maps/${record.mapUId}`);
                            },
                        })}
                    />
                </Card>

            </Layout.Content>
        </Layout>
    );
};

export default Home;
