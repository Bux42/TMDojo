import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { BufferGeometry } from 'three';
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
import { getSampleIndexNearTime } from '../../lib/utils/replay';
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

const REVEAL_SPEED = 25;
const SECONDS_TO_REVEAL = 5;

interface ReplayLineProps {
    replay: ReplayData;
    lineType: LineType;
    replayLineOpacity: number;
}
const ReplayLine = ({
    replay, lineType, replayLineOpacity,
}: ReplayLineProps) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [curRevealTime, setCurRevealTime] = useState(0);

    const pointsGeometry = useMemo(() => {
        const points = replay.samples.map((sample) => sample.position);
        const colorBuffer = lineType.colorsCallback(replay);

        const bufferGeometry = new BufferGeometry()
            .setFromPoints(points)
            .setAttribute('color', colorBuffer);
        return bufferGeometry;
    }, [replay, replay.samples, lineType, replay.color]);

    useEffect(() => {
        if (!isRevealed) {
            pointsGeometry.setDrawRange(0, 0);
        }
    }, [isRevealed]);

    useFrame((state, delta) => {
        if (!isRevealed && curRevealTime < replay.endRaceTime) {
            // Constant time increase
            // const newRevealTime = curRevealTime + delta * REVEAL_SPEED * 1000;

            // Constant time to reveal
            const newRevealTime = curRevealTime + delta * (replay.endRaceTime / SECONDS_TO_REVEAL);

            // Set new time and update geometry
            setCurRevealTime(newRevealTime);

            const newIndex = getSampleIndexNearTime(replay, newRevealTime);
            const clampedIndex = Math.min(newIndex, replay.samples.length - 1);
            pointsGeometry.setDrawRange(0, clampedIndex);
        } else {
            setCurRevealTime(replay.endRaceTime);
            pointsGeometry.setDrawRange(0, replay.samples.length - 1);
            setIsRevealed(true);
        }
    });

    return (
        <line geometry={pointsGeometry}>
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
