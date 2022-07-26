import {
    useCallback, useEffect, useMemo, useState,
} from 'react';
import { BufferGeometry } from 'three';
import tryFetchModel from '../../../../lib/mapBlocks/fetchModel';
import { Instances, Transform } from './Instances';

interface InstancedModelsProps {
    modelName: string;
    transforms: Transform[];
    material: React.ReactNode;
    fallbackGeometry?: BufferGeometry;
    fallbackMaterial?: React.ReactNode;
}
const InstancedModels = ({
    modelName, transforms, material, fallbackGeometry, fallbackMaterial,
}: InstancedModelsProps) => {
    const [geometry, setGeometry] = useState<BufferGeometry>();

    const tryLoadModel = useCallback(async (): Promise<void> => {
        const model = await tryFetchModel(modelName);
        if (!model) return;
        setGeometry(model);
    }, [modelName, setGeometry]);

    useEffect(
        () => { tryLoadModel(); },
        [modelName, setGeometry, tryLoadModel],
    );

    const geometryToUse = useMemo(
        () => geometry || fallbackGeometry,
        [geometry, fallbackGeometry],
    );

    const materialToUse = useMemo(
        () => {
            if (!geometry && fallbackGeometry) {
                // Use fallback material if geometry is not loaded and fallback will be used
                return fallbackMaterial;
            }
            return material;
        },
        [geometry, fallbackGeometry, fallbackMaterial, material],
    );

    return (
        <>
            {geometryToUse ? (
                <Instances
                    geometry={geometryToUse}
                    transforms={transforms}
                    material={materialToUse}
                />
            ) : (null)}
        </>
    );
};

export default InstancedModels;
