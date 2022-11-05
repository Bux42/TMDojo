/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDetectGPU } from '@react-three/drei';
import { Checkbox, Modal } from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import showPerformanceWarning from '../popups/performanceWarning';

const useViewerPerformanceConfirmations = () => {
    const [showViewer, setShowViewer] = useState<boolean>(true);

    const router = useRouter();
    const gpuTier = useDetectGPU();

    const showPerformanceConfirmationModal = useCallback(() => {
        const stopShowingConfirmationModal = localStorage.getItem('stopShowingConfirmationModal') !== null;
        if (stopShowingConfirmationModal) return;

        let dontShowAgain = false;

        setShowViewer(false);

        Modal.confirm({
            title: 'Potential performance issues!',
            content: (
                <div>
                    <p>Based on your detected hardware, your device might struggle with the 3D viewer's performance requirements.</p>
                    <br />
                    <p>One of the reasons could be that you do not have hardware acceleration enabled.</p>
                    <p>Please try enabling hardware acceleration in your browser settings and try again.</p>
                    <br />
                    <p>If you really want to continue anyway, press &apos;Continue&apos;.</p>
                    <br />
                    <Checkbox
                        value={dontShowAgain}
                        onChange={(e) => { dontShowAgain = e.target.checked; }}
                    >
                        Don't show again
                    </Checkbox>
                </div>
            ),
            okText: 'Continue',
            cancelText: 'Back to homepage',
            centered: true,
            width: '600',
            icon: <ExclamationCircleOutlined style={{ color: '#a61d24' }} />,
            onOk: () => {
                setShowViewer(true);
                if (dontShowAgain) {
                    localStorage.setItem('stopShowingConfirmationModal', dayjs().unix().toString());
                }
            },
            onCancel: () => {
                router.push('/');
            },
        });
    }, [router]);

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
            showPerformanceConfirmationModal();
        }
    }, [gpuTier, showPerformanceConfirmationModal]);

    return { showViewer, showPerformanceConfirmationModal };
};

export default useViewerPerformanceConfirmations;
