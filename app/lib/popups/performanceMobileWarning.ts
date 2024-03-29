import { Modal } from 'antd';
import dayjs from 'dayjs';

const MOBILE_VIEWER_WARNING_SHOWN_KEY = 'mobileViewerWarningShown';

const showMobilePerformanceWarning = () => {
    const shownMobileWarning = localStorage.getItem(MOBILE_VIEWER_WARNING_SHOWN_KEY) !== null;
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
    localStorage.setItem(MOBILE_VIEWER_WARNING_SHOWN_KEY, dayjs().unix().toString());
};

export default showMobilePerformanceWarning;
