import React, { useCallback, useContext, useMemo } from 'react';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import {
    accelerationReplayColors,
    defaultReplayColors,
    gearReplayColors,
    rpmReplayColors,
    speedReplayColors,
    inputReplayColors,
} from '../../lib/replays/replayLineColors';
import ReplayChartHoverLocation from './ReplayChartHoverLocation';
import ReplayDnf from './ReplayDnf';
import ReplayGears from './ReplayGears';

export interface LineType {
    name: string;
    colorsCallback: (replay: ReplayData) => THREE.Float32BufferAttribute;
}
export const LineTypes: { [name: string]: LineType } = {
    default: { name: 'Default', colorsCallback: defaultReplayColors },
    speed: { name: 'Speed', colorsCallback: speedReplayColors },
    acceleration: { name: 'Acceleration', colorsCallback: accelerationReplayColors },
    gear: { name: 'Gear', colorsCallback: gearReplayColors },
    rpm: { name: 'RPM', colorsCallback: rpmReplayColors },
    inputs: { name: 'Inputs', colorsCallback: inputReplayColors },
};

interface ReplayLineProps {
    replay: ReplayData;
    lineType: LineType;
    replayLineOpacity: number;
}
const ReplayLine = ({
    replay, lineType, replayLineOpacity,
}: ReplayLineProps) => {
    const points = useMemo(() => replay.samples.map((sample) => sample.position), [replay.samples]);
    const colorBuffer = useMemo(() => lineType.colorsCallback(replay), [replay, lineType, replay.color]);

    const onUpdate = useCallback(
        (self) => {
            self.setFromPoints(points);
            self.setAttribute('color', colorBuffer);
        },
        [points, colorBuffer],
    );

    return (
        <line>
            <bufferGeometry onUpdate={onUpdate} />
            <lineBasicMaterial
                linewidth={10}
                transparent
                opacity={replayLineOpacity}
                linecap="round"
                linejoin="round"
                vertexColors
            />
        </line>
    );
};

interface ReplayLinesProps {
    replaysData: ReplayData[];
    lineType: LineType;
    replayLineOpacity: number;
    showGearChanges: boolean;
}
export const ReplayLines = ({
    replaysData,
    lineType,
    replayLineOpacity,
    showGearChanges,
}: ReplayLinesProps): JSX.Element => (
    <>
        {replaysData.map((replay) => (
            <>
                <ReplayLine
                    key={`replay-${replay._id}-line`}
                    replay={replay}
                    lineType={lineType}
                    replayLineOpacity={replayLineOpacity}
                />
                <ReplayChartHoverLocation
                    key={`replay-${replay._id}-chart-hover`}
                    replay={replay}
                />
                {showGearChanges && (
                    <ReplayGears key={`replay-${replay._id}-gears`} replay={replay} />
                )}
                {(replay.dnfPos.x !== 0 && replay.dnfPos.y !== 0 && replay.dnfPos.z !== 0) && (
                    <ReplayDnf key={`replay-${replay._id}-dnf`} replay={replay} />
                )}
            </>
        ))}
    </>
);
