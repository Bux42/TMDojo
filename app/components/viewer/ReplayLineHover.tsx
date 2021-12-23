import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { BackSide, DoubleSide, FrontSide } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import vecToQuat from '../../lib/utils/math';
import { ReplayData } from '../../lib/api/apiRequests';

interface ReplayLineHoverProps {
    replay: ReplayData;
    lineRef: React.RefObject<THREE.Line>;
}
const ReplayLineHover = ({ replay, lineRef }: ReplayLineHoverProps) => {
    const [renderedIntersections, setRenderedIntersections] = useState<THREE.Intersection[]>([]);
    const { raycaster } = useThree();

    if (raycaster !== undefined
        && raycaster.params !== undefined
        && raycaster.params.Line !== undefined) {
        raycaster.params.Line.threshold = 1;
    }

    useFrame(() => {
        if (lineRef.current && raycaster) {
            const intersects = raycaster.intersectObjects([lineRef.current], true);

            if (intersects.length > 0) {
                const distances = intersects.map((intersection) => {
                    // https://www.lighthouse3d.com/tutorials/maths/line-and-rays/
                    const p = raycaster.ray.origin.clone();
                    const q = intersection.point.clone();
                    const v = raycaster.ray.direction.clone();
                    const u = q.clone().sub(p);

                    const puv = v.clone().multiplyScalar(v.dot(u) / v.length());

                    const qA = p.clone().add(puv);

                    const d = (q.clone().sub(qA)).length();

                    return d;
                });

                const closestPointIndex = distances.indexOf(Math.min(...distances));
                const closestIntersection = intersects[closestPointIndex];

                setRenderedIntersections([closestIntersection]);
            } else if (renderedIntersections.length > 0) {
                setRenderedIntersections([]);
            }
        }
    });

    const hoveredSample = useMemo(() => (renderedIntersections.length > 0 && renderedIntersections[0].index
        ? replay.samples[renderedIntersections[0].index]
        : undefined),
    [renderedIntersections]);

    const rotation = useMemo(() => hoveredSample
    && new THREE.Euler().setFromQuaternion(vecToQuat(hoveredSample.dir, hoveredSample.up)),
    [hoveredSample]);

    return (
        <>
            {
                renderedIntersections.map((intersection, i) => (
                    <>
                        <Sphere args={[0.025]} position={intersection.point} />
                        {hoveredSample && (
                            <>
                                <mesh
                                    position={hoveredSample.position}
                                    rotation={rotation}
                                >
                                    <arrowHelper />
                                    <mesh>
                                        <planeGeometry args={[3, 1]} />
                                        <meshBasicMaterial side={BackSide} color="red" wireframe />
                                    </mesh>
                                    <mesh>
                                        <planeGeometry args={[3, 1]} />
                                        <meshBasicMaterial side={FrontSide} color="red" />
                                    </mesh>
                                    <Sphere args={[0.1]}>
                                        <meshBasicMaterial attach="material" side={DoubleSide} color="black" />
                                    </Sphere>
                                </mesh>
                            </>
                        )}
                    </>
                ))
            }
        </>
    );
};

export default ReplayLineHover;
