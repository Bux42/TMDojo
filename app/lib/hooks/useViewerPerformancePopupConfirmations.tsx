/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import { useDetectGPU } from '@react-three/drei';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import showPerformanceWarning from '../popups/performanceWarning';
import showPerformanceConfirmationModal from '../popups/performanceContinueConfirmation';
import showMobilePerformanceWarning from '../popups/performanceMobileWarning';

const useViewerPerformancePopupConfirmations = () => {
    const [showViewer, setShowViewer] = useState<boolean>(true);

    const router = useRouter();
    const gpuTier = useDetectGPU();

    useEffect(() => {
        // Skip if GPU tier in not yet detected
        if (!gpuTier) return;

        // If the user is on mobile, show the mobile performance warning
        if (gpuTier.isMobile) {
            showMobilePerformanceWarning();
            return;
        }

        if (gpuTier.tier === 2) {
            // Show performance warning when GPU tier is 2 (30 - 60 FPS)
            showPerformanceWarning();
        } else if (gpuTier.tier <= 1) {
            // Disable 3D viewer for users with a low-end GPU (<30 FPS), show modal for confirmation to continue
            setShowViewer(false);
            showPerformanceConfirmationModal(
                () => setShowViewer(true), // On confirm
                () => router.push('/'), // On cancel
            );
        }
    }, [gpuTier, router]);

    return { showViewer };
};

export default useViewerPerformancePopupConfirmations;
