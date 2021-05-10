import React, { useEffect, useState } from "react";
import { PageHeader, Button } from "antd";

import { MapInfo } from "../../lib/api/apiRequests";

interface Props {
    mapInfo: MapInfo;
}

export const MapHeader = ({ mapInfo }: Props): JSX.Element => {
    return (
        <PageHeader
            onBack={() => null} // TODO: add link to home when that exists
            title="Replay viewer"
            subTitle={mapInfo.name}
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
