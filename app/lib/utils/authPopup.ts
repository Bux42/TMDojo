// https://dev.to/dinkydani21/how-we-use-a-popup-for-google-and-outlook-oauth-oci
let windowReference: Window | null = null;
let previousUrl: string | undefined;

const openAuthWindow = (
    url: string,
    name: string,
    listener: (event: any) => void,
) => {
    // Remove any existing event listeners
    window.removeEventListener('message', listener);

    // Window features
    const windowFeatures = 'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';

    if (windowReference === null || windowReference.closed) {
        // If there is no reference to a window or the window was closed, open a new one
        windowReference = window.open(url, name, windowFeatures);
    } else {
        if (previousUrl !== url) {
            // If the url changed, open a new window
            windowReference = window.open(url, name, windowFeatures);
        }
        // If a window exists, focus window
        windowReference?.focus();
    }

    // Add the listener for receiving a message from the popup
    window.addEventListener('message', listener, false);

    // Assign the previous URL
    previousUrl = url;
};

export default openAuthWindow;
