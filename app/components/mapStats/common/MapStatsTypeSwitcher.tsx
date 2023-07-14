import React, { useContext } from 'react';
import { MapInfo } from '../../../lib/api/requests/maps';
import { AuthContext } from '../../../lib/contexts/AuthContext';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import CleanButton from '../../common/CleanButton';

export enum MapStatsType {
    GLOBAL = 'Global',
    PERSONAL = 'Personal'
}

const oppositeType = (type: MapStatsType) => {
    if (type === MapStatsType.GLOBAL) {
        return MapStatsType.PERSONAL;
    }
    return MapStatsType.GLOBAL;
};

interface MapStatsTypeSwitcherProps {
    mapStatsType: MapStatsType;
    mapData: MapInfo;
    toggleMapStatsType: () => void;
}
export const MapStatsTypeSwitcher = ({ mapStatsType, mapData, toggleMapStatsType }: MapStatsTypeSwitcherProps) => {
    const { user, startAuthFlow } = useContext(AuthContext);

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="text-xl">
                {`You are currently viewing ${mapStatsType === MapStatsType.GLOBAL ? 'the' : 'your'} `}
                <b>{mapStatsType}</b>
                {' statistics'}
                {mapData.mapName && (
                    <>
                        {' for '}
                        <b>{cleanTMFormatting(mapData.mapName)}</b>
                    </>
                )}
            </div>
            {user
                ? (
                    <CleanButton
                        backColor="hsl(0, 0%, 12%)"
                        onClick={toggleMapStatsType}
                    >
                        {`Switch to ${oppositeType(mapStatsType)} statistics`}
                    </CleanButton>
                ) : (
                    <CleanButton
                        backColor="hsl(0, 0%, 12%)"
                        onClick={startAuthFlow}
                    >
                        Log in for personal statistics
                    </CleanButton>
                )}
        </div>
    );
};
