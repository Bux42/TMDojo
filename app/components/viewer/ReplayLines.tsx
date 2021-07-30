import React, { useCallback, useMemo } from 'react';
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
    rpm: { name: 'RPMs', colorsCallback: rpmReplayColors },
    inputs: { name: 'Inputs', colorsCallback: inputReplayColors },
};

interface ReplayLineProps {
    replay: ReplayData;
    lineType: LineType;
    range: number[];
    replayLineOpacity: number;
}
const ReplayLine = ({
    replay, lineType, range, replayLineOpacity,
}: ReplayLineProps) => {
    const points = useMemo(() => {
        if (range.length > 0) {
            return replay.samples
                .filter(
                    (sample) => sample.currentRaceTime >= range[0] && sample.currentRaceTime <= range[1],
                )
                .map((sample) => sample.position);
        }
        return replay.samples.map((sample) => sample.position);
    }, [replay.samples, range]);

    const colorBuffer = useMemo(() => lineType.colorsCallback(replay), [replay, lineType]);

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
    range: number[];
    replayLineOpacity: number;
    showGearChanges: boolean;
}
export const ReplayLines = ({
    replaysData,
    lineType,
    range,
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
                    range={range}
                    replayLineOpacity={replayLineOpacity}
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
