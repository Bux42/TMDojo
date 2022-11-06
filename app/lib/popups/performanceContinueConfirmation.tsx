/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Checkbox, Modal } from 'antd';
import dayjs from 'dayjs';

const STOP_SHOWING_PERFORMANCE_CONFIRMATION_KEY = 'stopShowingPerformanceContinueConfirmation';

const showPerformanceConfirmationModal = (
    onModalOk: () => void,
    onModalCancel: () => void,
) => {
    const stopShowingConfirmationModal = localStorage.getItem(STOP_SHOWING_PERFORMANCE_CONFIRMATION_KEY) !== null;
    if (stopShowingConfirmationModal) {
        onModalOk();
        return;
    }

    let dontShowAgain = false;

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
            onModalOk();
            if (dontShowAgain) {
                localStorage.setItem(STOP_SHOWING_PERFORMANCE_CONFIRMATION_KEY, dayjs().unix().toString());
            }
        },
        onCancel: () => {
            onModalCancel();
        },
    });
};

export default showPerformanceConfirmationModal;
