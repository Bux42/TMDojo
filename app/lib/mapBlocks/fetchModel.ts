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

// eslint-disable-next-line arrow-body-style
const tryCreatePrimitiveModel = (modelName: string): BufferGeometry | undefined => {
    // This method is replaced by a more general solution with replacing 'Pillar' in the name
    // Keep this method around in case it's needed again

    return undefined;
};

// Remove all collision children, these have very odd meshes and do not need to be rendered
const removeCollisionChildrenFromModel = (model: Group) => {
    model.traverse((child) => {
        if (!(child instanceof Mesh)) return;

        if (child.name.includes('Collisions')) {
            model.remove(child);
        }
    });
};

const tryFetchModel = async (modelName: string): Promise<Group | undefined> => {
    const objPath = `${baseBlockMeshesPath}/${modelName}.obj`;
    const mtlPath = `${baseBlockMeshesPath}/${modelName}.mtl`;

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    try {
        const mtl = await mtlLoader.loadAsync(mtlPath);
        mtl.preload();

        objLoader.setMaterials(mtl);

        const model = await objLoader.loadAsync(objPath);

        removeCollisionChildrenFromModel(model);

        return model;
    } catch (e) {
        // Model load failed, model could be do nothing
        // TODO: Only catch errors of models not found. Currently ignores all other errors too
    }

    // Models with the suffix 'Pillar' usually map directly to their counterpart without 'Pillar' at the end
    // Try to load the model without 'Pillar at the end
    if (modelName.includes('Pillar')) {
        const modelNameWithoutPillar = modelName.replace('Pillar', '');
        const modelWithoutPillarInName = await tryFetchModel(modelNameWithoutPillar);
        if (modelWithoutPillarInName) {
            return modelWithoutPillarInName;
        }
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
