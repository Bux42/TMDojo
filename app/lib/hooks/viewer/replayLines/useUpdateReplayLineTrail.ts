import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { ReplayData } from '../../../api/apiRequests';
import GlobalTimeLineInfos from '../../../singletons/timeLineInfos';
import { getSampleIndexNearTime } from '../../../utils/replay';

interface LineUpdateIndices {
    startIndex: number;
    endIndex: number;
    segmentUpdate: boolean;
}

const useUpdateReplayLineTrail = (
    bufferRef: React.MutableRefObject<THREE.BufferGeometry | undefined>,
    replay: ReplayData,
    trailFadeTime: number,
) => {
    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const previousLineUpdate = useRef<LineUpdateIndices>();

    const updateLineTrail = () => {
        if (!bufferRef.current) return;

        const {
            showFullTrail, showTrailToStart, revealTrailTime, currentRaceTime,
        } = timeLineGlobal;

        const curSampleIndex = getSampleIndexNearTime(replay, timeLineGlobal.currentRaceTime);

        if (showFullTrail || showTrailToStart) {
            if (!previousLineUpdate.current || previousLineUpdate.current.segmentUpdate) {
                // Reset alpha of full line if it's the first update or if the previous update was a segment update
                for (let i = 0; i < replay.samples.length; i++) {
                    bufferRef.current.attributes.color.setW(i, 1);
                }
                bufferRef.current.attributes.color.needsUpdate = true;
            }

            if (showFullTrail) {
                bufferRef.current.setDrawRange(0, replay.samples.length);
            } else {
                bufferRef.current.setDrawRange(0, curSampleIndex);
            }

            previousLineUpdate.current = {
                startIndex: 0,
                endIndex: replay.samples.length,
                segmentUpdate: false,
            };
        } else {
            // Get trail indices
            const startTrailIndex = getSampleIndexNearTime(
                replay,
                currentRaceTime - revealTrailTime,
            );
            const endFadeIndex = getSampleIndexNearTime(
                replay,
                currentRaceTime - revealTrailTime + trailFadeTime,
            );

            // Clamp trail indices
            const startTrailIndexClamped = Math.max(0, Math.min(startTrailIndex, replay.samples.length));
            const endFadeIndexClamped = Math.max(0, Math.min(endFadeIndex, curSampleIndex, replay.samples.length));

            const prev = previousLineUpdate.current;
            // Update starts at trail index or previous start index (or 0 if no previous update has occured)
            const updateStart = Math.min(startTrailIndexClamped, prev?.startIndex || 0);
            // Update starts at sample index or previous end index (or end of line if no previous update has occured)
            const updateEnd = Math.max(curSampleIndex, prev?.endIndex || replay.samples.length);

            // Update line alpha if needed (previous was not a segment update or update range changed)
            if (!prev?.segmentUpdate || updateStart !== prev?.startIndex || updateEnd !== prev?.endIndex) {
                for (let i = updateStart; i < updateEnd; i++) {
                    if (i < startTrailIndexClamped) {
                        // Index before minimum index, hide line: set alpha to 0
                        bufferRef.current.attributes.color.setW(i, 0);
                    } else if (i < endFadeIndexClamped) {
                        // Index after trail start, before fade end, fade alpha between 0 and 1
                        const alpha = (i - startTrailIndexClamped) / (endFadeIndexClamped - startTrailIndexClamped);
                        bufferRef.current.attributes.color.setW(i, alpha);
                    } else {
                        // Index after fade end, show line: set alpha to 1
                        bufferRef.current.attributes.color.setW(i, 1);
                    }
                }
                bufferRef.current.attributes.color.needsUpdate = true;
            }

            // Set line draw range
            const samplesToDraw = curSampleIndex - startTrailIndexClamped;
            bufferRef.current.setDrawRange(startTrailIndexClamped, samplesToDraw);

            // Set start and end to trail start and end
            previousLineUpdate.current = {
                startIndex: startTrailIndexClamped,
                endIndex: curSampleIndex,
                segmentUpdate: true,
            };
        }
    };

    useFrame(() => {
        updateLineTrail();
    });

    const manualLineTrailUpdate = () => {
        previousLineUpdate.current = undefined;
        updateLineTrail();
    };

    return { manualLineTrailUpdate };
};

export default useUpdateReplayLineTrail;
