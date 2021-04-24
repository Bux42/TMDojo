import React, { useCallback, useMemo } from "react";
import { ReplayData as ReplayData } from "../../lib/api/fileRequests";

interface ReplayLineProps {
    replay: ReplayData;
}
const ReplayLine = ({ replay }: ReplayLineProps) => {
    const points = useMemo(() => replay.samples.map((sample) => sample.position), []);
    const onUpdate = useCallback((self) => self.setFromPoints(points), [points]);

    return (
        <line>
            <bufferGeometry attach="geometry" onUpdate={onUpdate} />
            <lineBasicMaterial
                attach="material"
                color={"#9c88ff"}
                linewidth={10}
                linecap={"round"}
                linejoin={"round"}
            />
        </line>
    );
};

interface ReplayLinesProps {
    replaysData: ReplayData[];
}
export const ReplayLines = ({ replaysData }: ReplayLinesProps): JSX.Element => {
    return (
        <>
            {replaysData.map((replay) => {
                return <ReplayLine key={replay._id} replay={replay} />;
            })}
        </>
    );
};
