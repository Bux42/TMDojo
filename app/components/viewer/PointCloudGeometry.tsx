import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/apiRequests';

const EDGE_LENGTH_THRESHOLD = 8;

interface PointInfo {
    vertices: THREE.Vector3[];
    colors: THREE.Color[];
    normals: THREE.Vector3[];
}
const getReplayPoints = (replaysData: ReplayData[]): PointInfo => {
    const vertices: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const normals: THREE.Vector3[] = [];

    const WIDTH = 1.7;
    const LENGTH = 3;
    const DEFAULT_COLOR = new THREE.Color(0.8, 0.5, 0.1);

    const getColor = (groundMaterial: number) => {
        // Dirt
        if (groundMaterial === 6) {
            return new THREE.Color(0.2, 0.1, 0.0);
        }
        // Asphalt
        if (groundMaterial === 16) {
            return new THREE.Color(0.3, 0.3, 0.3);
        }
        // Water
        if (groundMaterial === 13) {
            return new THREE.Color(0.025, 0.025, 1);
        }
        // Metal
        if (groundMaterial === 4) {
            return new THREE.Color(0.1, 0.1, 0.1);
        }
        // Grass
        if (groundMaterial === 76) {
            return new THREE.Color(0.1, 0.9, 0.1);
        }
        return DEFAULT_COLOR;
    };

    replaysData.forEach((replay) => replay.samples
        // .filter((sample) => sample.position.lengthSq() > 0.1)
        .forEach((sample) => {
            const up = sample.up.clone();
            const side = sample.dir.clone().cross(up).multiplyScalar(WIDTH / 2);
            const front = sample.dir.clone().multiplyScalar(LENGTH / 2);
            const basePos = sample.position.clone().addScaledVector(front, 0.2);

            if (sample.rLGroundContactMaterial !== 80) {
                const pos = basePos.clone()
                    .sub(front)
                    .sub(side)
                    .sub(up.clone().multiplyScalar(sample.rLDamperLen));
                vertices.push(pos);
                colors.push(getColor(sample.rLGroundContactMaterial));
            }
            if (sample.rRGroundContactMaterial !== 80) {
                const pos = basePos.clone()
                    .sub(front)
                    .add(side)
                    .sub(up.clone().multiplyScalar(sample.rRDamperLen));
                vertices.push(pos);
                colors.push(getColor(sample.rRGroundContactMaterial));
            }
            if (sample.fLGroundContactMaterial !== 80) {
                const pos = basePos.clone()
                    .add(front)
                    .sub(side)
                    .sub(up.clone().multiplyScalar(sample.fLDamperLen));
                vertices.push(pos);
                colors.push(getColor(sample.fLGroundContactMaterial));
            }
            if (sample.fRGroundContactMaterial !== 80) {
                const pos = basePos.clone()
                    .add(front)
                    .add(side)
                    .sub(up.clone().multiplyScalar(sample.fRDamperLen));
                vertices.push(pos);
                colors.push(getColor(sample.fRGroundContactMaterial));
            }

            normals.push(up);
        }));

    return { vertices, colors, normals };
};

const filterTrianglesByEdgeLength = (
    vertices: THREE.Vector3[],
    triIndices: Uint32Array,
    edgeLengthThreshold: number,
) => {
    const thresholdSq = edgeLengthThreshold ** 2;

    const closeTriangles = [];

    for (let i = 0; i < triIndices.length; i += 3) {
        const v1 = vertices[triIndices[i]];
        const v2 = vertices[triIndices[i + 1]];
        const v3 = vertices[triIndices[i + 2]];

        const e1 = v1.distanceToSquared(v2);
        const e2 = v1.distanceToSquared(v3);
        const e3 = v2.distanceToSquared(v3);

        // If all edge lengths are smaller than threshold, add triangle indices to array
        if (e1 < thresholdSq && e2 < thresholdSq && e3 < thresholdSq) {
            closeTriangles.push(...[
                triIndices[i],
                triIndices[i + 1],
                triIndices[i + 2],
            ]);
        }
    }

    return closeTriangles;
};

const triangulatePointCloud = async (vertices: THREE.Vector3[]): Promise<number[]> => {
    const Delaunator = await (await import('delaunator')).default;
    const indexDelaunay = Delaunator.from(
        vertices.map((v) => [v.x, v.z]),
    );

    const closeTriangles = filterTrianglesByEdgeLength(
        vertices,
        indexDelaunay.triangles,
        EDGE_LENGTH_THRESHOLD,
    );

    return closeTriangles;
};

const ReplayPointsMesh = ({ replaysData }: ReplayLinesProps) => {
    const [meshGeom, setMeshGeom] = useState<THREE.BufferGeometry>();

    const { vertices, colors, normals } = useMemo(() => getReplayPoints(replaysData), [replaysData]);

    useEffect(() => {
        const setNewGeom = async () => {
            const newMeshGeom = new THREE.BufferGeometry().setFromPoints(vertices);
            newMeshGeom.setAttribute(
                'color',
                new THREE.Float32BufferAttribute(colors.flatMap((c) => [c.r, c.g, c.b]), 3),
            );

            const triangleIndices = await triangulatePointCloud(vertices);

            newMeshGeom.setIndex(triangleIndices);
            newMeshGeom.computeVertexNormals();

            setMeshGeom(newMeshGeom);
        };
        setNewGeom();
    }, [replaysData]);

    return (
        <>
            <mesh geometry={meshGeom} castShadow>
                <meshStandardMaterial side={THREE.DoubleSide} vertexColors />
            </mesh>
            {/* <mesh geometry={meshGeom} castShadow>
                <meshNormalMaterial vertexColors wireframe />
            </mesh> */}
            {/* <points geometry={meshGeom}>
                <pointsMaterial vertexColors />
            </points> */}
        </>
    );
};

interface ReplayLinesProps {
    replaysData: ReplayData[];
}
const PointCloudGeometry = ({
    replaysData,
}: ReplayLinesProps) => (
    <>
        {replaysData.length > 0 ? (
            <ReplayPointsMesh replaysData={replaysData} />
        ) : null}
    </>
);

export default PointCloudGeometry;
