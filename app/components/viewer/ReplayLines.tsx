import { useFrame } from '@react-three/fiber';
import React, { useCallback, useMemo, useRef } from 'react';
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
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import { getSampleIndexNearTime, getSampleNearTime } from '../../lib/utils/replay';
import ReplayChartHoverLocation from './ReplayChartHoverLocation';
import ReplayDnf from './ReplayDnf';
import ReplayGears from './ReplayGears';
import ReplaySectorHighlights from './ReplaySectorHighlights';

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
    revealTrail?: boolean;
    revealTrailTime?: number;
}
const ReplayLine = ({
    replay, lineType, replayLineOpacity, revealTrail, revealTrailTime,
}: ReplayLineProps) => {
    const bufferGeom = useRef<THREE.BufferGeometry>();
    const points = useMemo(() => replay.samples.map((sample) => sample.position), [replay.samples]);
    const colorBuffer = useMemo(() => lineType.colorsCallback(replay), [replay, lineType, replay.color]);

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const onUpdate = useCallback(
        (self) => {
            self.setFromPoints(points);
            self.setAttribute('color', colorBuffer);
        },
        [points, colorBuffer],
    );

    useFrame(() => {
        if (!bufferGeom.current) return;

        if (!revealTrail) {
            bufferGeom.current.setDrawRange(0, points.length);
            return;
        }

        const sampleIndex = getSampleIndexNearTime(replay, timeLineGlobal.currentRaceTime);
        const sampleIndexMin = (revealTrailTime !== undefined)
            ? Math.max(
                0,
                getSampleIndexNearTime(replay, timeLineGlobal.currentRaceTime - revealTrailTime),
            )
            : 0;

        const diff = sampleIndex - sampleIndexMin;
        const minIndexClamped = Math.max(0, Math.min(sampleIndex - diff, replay.samples.length));
        const numSamplesToDraw = Math.min(Math.max(sampleIndex, sampleIndex - diff), diff);

        bufferGeom.current.setDrawRange(minIndexClamped, numSamplesToDraw);
    });

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
                    revealTrail
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
