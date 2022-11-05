/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import { useDetectGPU } from '@react-three/drei';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import showPerformanceWarning from '../popups/performanceWarning';
import showPerformanceConfirmationModal from '../popups/performanceContinueConfirmation';

const useViewerPerformancePopupConfirmations = () => {
    const [showViewer, setShowViewer] = useState<boolean>(true);

    const router = useRouter();
    const gpuTier = useDetectGPU();

    useEffect(() => {
        // Skip if GPU tier in not yet detected
        if (!gpuTier) return;

        // Handle less performant mobile devices differently
        if (gpuTier?.isMobile) return;

        if (gpuTier?.tier === 2) {
            // Show performance warning when GPU tier is 2 (30 - 60 FPS)
            showPerformanceWarning();
        } else if (gpuTier?.tier === 3) {
            // Disable 3D viewer for users with a low-end GPU (<30 FPS), show modal for confirmation to continue anyways
            setShowViewer(false);
            showPerformanceConfirmationModal(
                () => setShowViewer(true),
                () => router.push('/'),
            );
        }
    }, [gpuTier, router]);

    return { showViewer };
};

export default useViewerPerformancePopupConfirmations;
