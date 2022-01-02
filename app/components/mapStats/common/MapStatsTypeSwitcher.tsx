import React, { useContext } from 'react';
import { Button, Card } from 'antd';
import { MapInfo } from '../../../lib/api/apiRequests';
import { AuthContext } from '../../../lib/contexts/AuthContext';

export enum MapStatsType {
    GLOBAL = 'Global',
    PERSONAL = 'Personal'
}

interface MapStatsTypeSwitcherProps {
    mapStatsType: MapStatsType;
    mapData: MapInfo;
    toggleMapStatsType: () => void;
}
export const MapStatsTypeSwitcher = ({ mapStatsType, mapData, toggleMapStatsType } : MapStatsTypeSwitcherProps) => {
    const { user, startAuthFlow } = useContext(AuthContext);

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="text-xl">
                You are currently viewing
                {' '}
                {mapStatsType === MapStatsType.GLOBAL ? 'the' : 'your'}
                {' '}
                <b>{mapStatsType}</b>
                {' '}
                statistics
                {' '}
                {mapData.name && (
                    <>
                        {'for '}
                        <b>
                            {mapData.name}
                        </b>
                    </>
                )}
            </div>
            {user
                ? (
                    <Button
                        type="ghost"
                        onClick={toggleMapStatsType}
                    >
                        Switch to
                        {' '}
                        {mapStatsType === MapStatsType.GLOBAL
                            ? MapStatsType.PERSONAL
                            : MapStatsType.GLOBAL}
                        {' '}
                        statistics
                    </Button>
                ) : (
                    <Button
                        type="ghost"
                        onClick={startAuthFlow}
                    >
                        Log in to view your personal statistics
                    </Button>
                )}
        </div>
    );
};
