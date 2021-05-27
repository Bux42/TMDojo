import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { PageHeader, Button } from "antd";

import { MapInfo } from "../../lib/api/apiRequests";
import { cleanTMFormatting } from "../../lib/utils/formatting";

interface Props {
    mapInfo: MapInfo;
}

export const MapHeader = ({ mapInfo }: Props): JSX.Element => {
    const router = useRouter();

    const hasExchangeId = mapInfo.exchangeid !== undefined && mapInfo.exchangeid !== 0;

    const TmxButton = () => (
        <Button key="tmx" type="primary" disabled={!hasExchangeId}>
            TM Exchange
        </Button>
    );

    return (
        <PageHeader
            onBack={() => router.push("/")}
            title="Replay viewer"
            subTitle={cleanTMFormatting(mapInfo.name || "")}
            extra={
                <>
                    <Link href={`https://trackmania.io/#/leaderboard/${mapInfo.mapUid}`}>
                        <a target="__blank">
                            <Button key="tm.io" type="primary">
                                trackmania.io
                            </Button>
                        </a>
                    </Link>

                    {hasExchangeId ? (
                        <Link href={`https://trackmania.exchange/maps/${mapInfo.exchangeid}`}>
                            <a target="__blank">
                                <TmxButton />
                            </a>
                        </Link>
                    ) : (
                        <TmxButton />
                    )}
                </>
            }
        />
    );
};
