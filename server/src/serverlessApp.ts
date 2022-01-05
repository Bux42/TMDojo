/* eslint-disable import/prefer-default-export */
import * as serverless from 'serverless-http';
import app from './tmDojoApp';

export const handler = serverless(app, {
    binary: ['application/octet-stream'],
});
