import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Layout, Input, Table, Tooltip, Button } from "antd";
import { ColumnsType } from "antd/lib/table";

import { AvailableMap, getAvailableMaps } from "../lib/api/apiRequests";
import { ReloadOutlined } from "@ant-design/icons";

interface ExtendedAvailableMap extends AvailableMap {
    key: string;
}

const Home = (): JSX.Element => {
    const [maps, setMaps] = useState<ExtendedAvailableMap[]>([]);
    const [searchString, setSearchString] = useState<string>("");

    const fetchMaps = async () => {
        const fetchedMaps = await getAvailableMaps(searchString);
        const preparedMaps = fetchedMaps.map((fetchedMap) => {
            return {
                ...fetchedMap,
                key: fetchedMap.mapUId,
            };
        });
        setMaps(preparedMaps);
    };

    useEffect(() => {
        fetchMaps();
    }, [searchString]);

    const columns: ColumnsType<ExtendedAvailableMap> = [
        {
            title: "Map name",
            dataIndex: "mapName",
            render: (_, map) => (
                <Link href={`/maps/${map.mapUId}`}>
                    <a>{map.mapName}</a>
                </Link>
            ),
            sorter: (a, b) => a.mapName.localeCompare(b.mapName),
            width: "90%",
        },
        {
            title: "Replays",
            dataIndex: "count",
            sorter: (a, b) => a.count - b.count,
            defaultSortOrder: "descend",
            width: "10%",
        },
    ];

    return (
        <Layout>
            <Layout.Content className="w-3/4 m-auto h-full flex flex-col justify-center">
                <div>
                    <div className="flex flex-row items-center my-2 gap-4">
                        <span>Looking for a map?</span>
                        <Tooltip title="Refresh">
                            <Button
                                shape="circle"
                                size="large"
                                icon={<ReloadOutlined />}
                                onClick={fetchMaps}
                            />
                        </Tooltip>
                    </div>
                    <Input.Search
                        placeholder="Enter a map name"
                        onSearch={(searchVal) => setSearchString(searchVal)}
                    />
                    <Table
                        className="dojo-map-search-table"
                        dataSource={maps}
                        columns={columns}
                        size="small"
                        showSorterTooltip={false}
                        pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}
                    />
                </div>
            </Layout.Content>
        </Layout>
    );
};

export default Home;
