const logErrorResponse = (e: any) => {
    if (e.response) {
        // eslint-disable-next-line no-console
        console.error({ error: e.response });
    } else {
        // eslint-disable-next-line no-console
        console.error(e);
    }
};

export default logErrorResponse;
