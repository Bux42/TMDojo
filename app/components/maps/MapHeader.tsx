import React from "react";
import { useRouter } from "next/router";
import { PageHeader, Button } from "antd";

import { MapInfo } from "../../lib/api/apiRequests";
import { cleanTMFormatting } from "../../lib/utils/formatting";

interface Props {
    mapInfo: MapInfo;
}

export const MapHeader = ({ mapInfo }: Props): JSX.Element => {
    const router = useRouter();

    return (
        <PageHeader
            onBack={() => router.push(`${location.origin}/`)}
            title="Replay viewer"
            subTitle={cleanTMFormatting(mapInfo.name || "")}
            extra={
                <>
                    <Button
                        key="tm.io"
                        type="primary"
                        onClick={() => {
                            // TODO: how do we want to route? probably should have a convention
                            location.href = `https://trackmania.io/#/leaderboard/${mapInfo.mapUid}`;
                        }}
                    >
                        trackmania.io
                    </Button>
                    {mapInfo.exchangeid ? (
                        <Button
                            key="tmx"
                            type="primary"
                            onClick={() => {
                                location.href = `https://trackmania.exchange/maps/${mapInfo.exchangeid}`;
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
