import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';

const useIsMobileDevice = () => {
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        const UserAgentInstance = new UAParser(window.navigator.userAgent);

        const isMobile = UserAgentInstance.getDevice().type === 'mobile';

        setIsMobileDevice(isMobile);
    }, []);

    return isMobileDevice;
};

export default useIsMobileDevice;
