// https://dev.to/dinkydani21/how-we-use-a-popup-for-google-and-outlook-oauth-oci
let windowReference: Window | null = null;
let previousUrl: string | undefined;

const openAuthWindow = (
    url: string,
    name: string,
) => {
    const windowFeatures = 'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';

    if (windowReference === null || windowReference.closed || previousUrl !== url) {
        windowReference = window.open(url, name, windowFeatures);
        windowReference?.focus();
    }

    previousUrl = url;
};

export default openAuthWindow;
