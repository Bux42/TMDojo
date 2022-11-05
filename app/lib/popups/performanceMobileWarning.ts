import { Modal } from 'antd';
import dayjs from 'dayjs';

const showMobilePerformanceWarning = () => {
    const shownMobileWarning = localStorage.getItem('mobileViewerWarningShown') !== null;
    if (shownMobileWarning) return;

    Modal.warning({
        title: 'You\'re on mobile!',
        // eslint-disable-next-line max-len
        content: 'The 3D viewer is not designed for mobile use - if you want the best experience, visit the 3D viewer on a desktop.',
        centered: true,
        okText: 'Dismiss',
        okType: 'ghost',
        okButtonProps: {
            size: 'large',
        },
    });

    // Set date of showing warning to today
    localStorage.setItem('mobileViewerWarningShown', dayjs().unix().toString());
};

export default showMobilePerformanceWarning;
