import {
    BoxBufferGeometry, BufferGeometry, Mesh, Group,
} from 'three';
import { MTLLoader, OBJLoader } from 'three-stdlib';

import * as THREE from 'three';

// TODO: Place this somewhere that makes more sense
THREE.Cache.enabled = true;

// Path to local block meshes folder, from /public folder
const LOCAL_BLOCKS_MESHES_FOLDER = '/objs';

const cloudFrontUrl = process.env.NEXT_PUBLIC_MAP_MESHES_CLOUDFRONT_URL;
const baseBlockMeshesPath = cloudFrontUrl
    ? `${cloudFrontUrl}/nadeo` // Remote CloudFront URL to block meshes folder
    : LOCAL_BLOCKS_MESHES_FOLDER; // Fallback to local blocks meshes folder if CloudFront URL is not set

const tryCreatePrimitiveModel = (modelName: string): BufferGeometry | undefined => {
    if (modelName === 'DecoWallBasePillar'
        || modelName === 'WaterWallPillar'
        || modelName === 'TrackWallStraightPillar') {
        // TODO: Optimize geometry creation, getting instantiated for each block
        const boxGeom = new BoxBufferGeometry(32, 8, 32);
        boxGeom.translate(16, 4, 16);
        return boxGeom;
    }

    if (modelName === 'StructurePillar') {
        // TODO: Optimize geometry creation, getting instantiated for each block
        const structurePillar = new BoxBufferGeometry(3, 8, 3);
        structurePillar.translate(16, 4, 16);
        return structurePillar;
    }

    return undefined;
};

const tryFetchModel = async (modelName: string): Promise<Group | undefined> => {
    // TODO: make some generalized solution for alternate models, in case there are more like this example
    if (modelName === 'DecoWallBasePillar') {
        return tryFetchModel('DecoWallBase');
    }

    const objPath = `${baseBlockMeshesPath}/${modelName}.obj`;
    const mtlPath = `${baseBlockMeshesPath}/${modelName}.mtl`;

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    try {
        const mtl = await mtlLoader.loadAsync(mtlPath);
        mtl.preload();

        objLoader.setMaterials(mtl);

        const group = await objLoader.loadAsync(objPath);

        return group;
    } catch (e) {
        // Model load failed, model could be do nothing
        // TODO: Only catch errors of models not found. Currently ignores all other errors too
    }

    // If there's no mesh, try to create primitive models for some simple blocks as backup
    const primitiveModel = tryCreatePrimitiveModel(modelName);
    if (primitiveModel) {
        const group = new Group();
        group.add(new Mesh(primitiveModel));
        return group;
    }

    return undefined;
};

export default tryFetchModel;
