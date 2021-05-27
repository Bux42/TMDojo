import React, { useCallback, useContext, useMemo } from "react";
import * as THREE from "three";
import { ReplayData as ReplayData } from "../../lib/api/fileRequests";
import { GraphContext } from "../../lib/contexts/GraphContext";
import {
    accelerationReplayColors,
    colorsToBuffer,
    defaultReplayColors,
    gearReplayColors,
    rpmReplayColors,
    speedReplayColors,
    inputReplayColors,
} from "../../lib/replays/replayLineColors";

export interface LineType {
    name: string;
    colorsCallback: (replay: ReplayData) => THREE.Float32BufferAttribute;
}
export const LineTypes: { [name: string]: LineType } = {
    default: { name: "Default", colorsCallback: defaultReplayColors },
    speed: { name: "Speed", colorsCallback: speedReplayColors },
    acceleration: { name: "Acceleration", colorsCallback: accelerationReplayColors },
    gear: { name: "Gear", colorsCallback: gearReplayColors },
    rpm: { name: "RPMs", colorsCallback: rpmReplayColors },
    inputs: { name: "Inputs", colorsCallback: inputReplayColors },
};

interface ReplayLineProps {
    replay: ReplayData;
    lineType: LineType;
    range: number[];
}
const ReplayLine = ({ replay, lineType, range }: ReplayLineProps) => {
    console.log("ReplayLine range:", range);
    let pointsTmp: THREE.Vector3[] = [];
    if (!range.length) {
        pointsTmp = replay.samples.map((sample) => sample.position, []);
    } else {
        pointsTmp = replay.samples
            .filter(
                (sample) => sample.currentRaceTime >= range[0] && sample.currentRaceTime <= range[1]
            )
            .map((sample) => sample.position, []);
    }
    const points = useMemo(() => pointsTmp, []);
    const colorBuffer = useMemo(() => lineType.colorsCallback(replay), [replay, lineType]);

    const onUpdate = useCallback(
        (self) => {
            self.setFromPoints(pointsTmp);
            self.setAttribute("color", colorBuffer);
        },
        [pointsTmp, colorBuffer]
    );

    return (
        <line>
            <bufferGeometry onUpdate={onUpdate} />
            <lineBasicMaterial
                linewidth={10}
                linecap={"round"}
                linejoin={"round"}
                vertexColors={true}
            />
        </line>
    );
};

interface ReplayLinesProps {
    replaysData: ReplayData[];
    lineType: LineType;
    range: number[];
}
export const ReplayLines = ({ replaysData, lineType, range }: ReplayLinesProps): JSX.Element => {
    return (
        <>
            {replaysData.map((replay) => {
                return (
                    <ReplayLine
                        key={replay._id}
                        replay={replay}
                        lineType={lineType}
                        range={range}
                    />
                );
            })}
        </>
    );
};
