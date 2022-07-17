import { BoxBufferGeometry, BufferGeometry, Mesh } from 'three';

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

const tryFetchModel = async (modelName: string): Promise<BufferGeometry | undefined> => {
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
    const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');

    const objPath = `/objs/${modelName}.obj`;
    const loader = new OBJLoader();

    try {
        const group = await loader.loadAsync(objPath);

        const geometries = group.children.map((model) => (model as Mesh).geometry);

        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

        return mergedGeometry;
    } catch (e) {
        // Model load failed, model could be do nothing
        // TODO: Only catch errors of models not found. Currently ignores all other errors too
    }

    // If there's no mesh, try to create primitive models for some simple blocks as backup
    const primitiveModel = tryCreatePrimitiveModel(modelName);
    if (primitiveModel) {
        return primitiveModel;
    }

    return undefined;
};

export default tryFetchModel;
