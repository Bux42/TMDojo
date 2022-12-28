const logErrorResponse = (e: any) => {
    if (e.response) {
        console.error({ error: e.response });
    } else {
        console.error(e);
    }
};

export default logErrorResponse;
