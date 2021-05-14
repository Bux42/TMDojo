import React, { useEffect, useState } from "react";
import { PageHeader, Button } from "antd";

import { getTmxId } from "../../lib/api/tmxRequests";

interface Props {
    mapUId: string;
}

export const MapHeader = ({ mapUId }: Props): JSX.Element => {
    const [tmxId, setTmxId] = useState("");

    useEffect(() => {
        const fetchTmxId = async () => {
            const fetchedTmxId = await getTmxId(mapUId);
            if (fetchedTmxId) {
                setTmxId(fetchedTmxId);
            }
        };
        fetchTmxId();
    }, []);

    return (
        <PageHeader
            onBack={() => null} // TODO: add link to home when that exists
            title="Replay viewer"
            subTitle="Map: Map name"
            extra={
                <>
                    <Button
                        key="tm.io"
                        type="primary"
                        onClick={() => {
                            // TODO: how do we want to route? probably should have a convention
                            location.href = `https://trackmania.io/#/leaderboard/${mapUId}`;
                        }}
                    >
                        trackmania.io
                    </Button>
                    {tmxId && tmxId !== "" ? (
                        <Button
                            key="tmx"
                            type="primary"
                            onClick={() => {
                                location.href = `https://trackmania.exchange/maps/${tmxId}`;
                            }}
                        >
                            TM Exchange
                        </Button>
                    ) : (
                        <></>
                    )}
                </>
            }
        />
    );
};
