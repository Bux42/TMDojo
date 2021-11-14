const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/api/info', (req: any, res: any) => {
    res.send({ application: 'sample-app', version: '1' });
});
app.post('/api/v1/getback', (req: any, res: any) => {
    res.send({ ...req.body });
});
export default app;
