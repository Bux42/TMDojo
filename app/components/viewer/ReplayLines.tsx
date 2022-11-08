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
    addAlphaChannel,
} from '../../lib/replays/replayLineColors';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import { getSampleIndexNearTime, getSampleNearTime } from '../../lib/utils/replay';
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
        return addAlphaChannel(colors);
    }, [replay, lineType]);

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

        const { showFullTrail, showTrailToStart, revealTrailTime } = timeLineGlobal;

        if (showFullTrail) {
            bufferGeom.current.setDrawRange(0, points.length);
            return;
        }

        // Get sample and trail indices
        const curSampleIndex = getSampleIndexNearTime(replay, timeLineGlobal.currentRaceTime);
        const startTrailIndex = showTrailToStart ? 0 : getSampleIndexNearTime(
            replay,
            timeLineGlobal.currentRaceTime - revealTrailTime,
        );

        const endFadeIndex = showTrailToStart ? 0 : getSampleIndexNearTime(
            replay,
            timeLineGlobal.currentRaceTime - revealTrailTime + TRAIL_FADE_SEGMENT_TIME,
        );

        // Clamp indices
        const startTrailIndexClamped = Math.max(0, Math.min(startTrailIndex, replay.samples.length));
        const endFadeIndexClamped = Math.max(0, Math.min(endFadeIndex, curSampleIndex, replay.samples.length));

        for (let i = 0; i < curSampleIndex; i++) {
            if (i < startTrailIndexClamped) {
                // Index before minimum index, hide line: set alpha to 0
                bufferGeom.current.attributes.color.setW(i, 0);
            } else if (i < endFadeIndexClamped) {
                // Index after trail start, before fade start, fade alpha between 0 and 1
                const alpha = (i - startTrailIndexClamped) / (endFadeIndexClamped - startTrailIndexClamped);
                bufferGeom.current.attributes.color.setW(i, alpha);
            } else {
                // Index after fade end, show line: set alpha to 1
                bufferGeom.current.attributes.color.setW(i, 1);
            }
        }
        bufferGeom.current.attributes.color.needsUpdate = true;

        const samplesToDraw = curSampleIndex - startTrailIndexClamped;
        bufferGeom.current.setDrawRange(startTrailIndexClamped, samplesToDraw);
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
