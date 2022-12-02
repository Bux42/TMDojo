/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Button, notification } from 'antd';
import dayjs from 'dayjs';

const STOP_SHOWING_PERFORMANCE_WARNING_KEY = 'stopShowingPerformanceWarning';

const showPerformanceWarning = () => {
    // Don't show the warning if the user has already dismissed it
    const stopShowingPerformanceWarning = localStorage.getItem(STOP_SHOWING_PERFORMANCE_WARNING_KEY) !== null;
    if (stopShowingPerformanceWarning) return;

    // Assign key to notification so we can close it later
    const key = `open${Date.now()}`;

    // Open warning notification
    notification.warning({
        key,
        message: 'Potential performance issues',
        description: 'Based on your detected hardware, you may get lower framerates in the 3D viewer. '
            + 'If you experience issues, try using a different device.',
        btn: (
            <Button
                type="ghost"
                onClick={() => {
                    localStorage.setItem(STOP_SHOWING_PERFORMANCE_WARNING_KEY, dayjs().unix().toString());
                    notification.close(key);
                }}
            >
                Don't show again
            </Button>
        ),
        placement: 'top',
        duration: 10,
    });
};

export default showPerformanceWarning;
