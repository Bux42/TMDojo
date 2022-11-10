import React, {
    useCallback, useEffect, useMemo, useRef,
} from 'react';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import useUpdateReplayLineTrail from '../../lib/hooks/viewer/replayLines/useUpdateReplayLineTrail';
import {
    accelerationReplayColors,
    defaultReplayColors,
    gearReplayColors,
    rpmReplayColors,
    speedReplayColors,
    inputReplayColors,
    addAlphaChannel,
} from '../../lib/replays/replayLineColors';
import ReplayChartHoverLocation from './ReplayChartHoverLocation';
import ReplayDnf from './ReplayDnf';
import ReplayGears from './ReplayGears';
import ReplaySectorHighlights from './ReplaySectorHighlights';

// Fade the end of segment of the trail, length in terms of time of the fading part of the trail in ms
const TRAIL_FADE_SEGMENT_TIME = 1000;

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
    const bufferGeom = useRef<THREE.BufferGeometry>();
    const points = useMemo(() => replay.samples.map((sample) => sample.position), [replay.samples]);
    const colorBuffer = useMemo(() => {
        const colors = lineType.colorsCallback(replay);

        // Set alpha to 0 by default to avoid flickering, it will be set to the correct value in the replay trail hook
        return addAlphaChannel(colors, 0);

        // We need the 'replay.color' variable to be in the dependency array, otherwise the colors will not update
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replay, replay.color, lineType]);

    const onUpdate = useCallback(
        (self) => {
            self.setFromPoints(points);
            self.setAttribute('color', colorBuffer);
        },
        [points, colorBuffer],
    );

    // Update the replay line trail based on trail settings
    const { manualLineTrailUpdate } = useUpdateReplayLineTrail(bufferGeom, replay, TRAIL_FADE_SEGMENT_TIME);

    useEffect(() => {
        if (!bufferGeom.current) return;
        bufferGeom.current.setAttribute('color', colorBuffer);
        manualLineTrailUpdate();
    }, [colorBuffer, manualLineTrailUpdate]);

    return (
        <line>
            <bufferGeometry ref={bufferGeom} onUpdate={onUpdate} />
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

                {/* Removed until fully implemented: */}
                {/*
                    {replay.sectorTimes && (
                        <ReplaySectorHighlights replay={replay} />
                    )}
                */}
            </>
        ))}
    </>
);
