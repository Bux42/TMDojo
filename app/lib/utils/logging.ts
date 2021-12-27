const logErrorResponse = (e: any) => {
    if (e.response) {
        console.log('Error response:', { response: e.response });
    } else {
        console.log('Error:', e);
    }
};

export default logErrorResponse;
