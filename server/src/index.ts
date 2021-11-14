import app from './tmDojoApp';

const defaultPort = Number(process.env.HTTP_PORT) || 80;

app.listen(defaultPort, () => {
    console.log(`App listening on port ${defaultPort}`);
});
