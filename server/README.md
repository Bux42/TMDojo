# TMDojo Server

This is the TMDojo back-end - based on Express.js.

## Setup

First, install the app's dependencies using `npm install`.

### Configuration

Use the `.env.template` to create your own `.env` - this is the main configuration file for the application.

- `USE_CERTIFICATES` is used to toggle SSL certificates - unless you're debugging this, you shouldn't need it during local development.
- `MONGO_URL` is the connection URL for the database - for local development we suggest running a MongoDB instance on your own system (you might have to manually create a `dojo` database).
- `HTTP_PORT` is the port that the server will listen on for HTTP requests.
- `HTTPS_PORT` is the port that the server will listen on for HTTPS requests, always 443 pretty much.

- `TM_API_CLIENT_ID` is your client ID from the TM API (api.trackmania.com).
- `TM_API_CLIENT_SECRET` is your client secret from the TM API (api.trackmania.com).

- `PREFERRED_STORAGE_TYPE` is either `S3` to store replay files in an S3 bucket, or `FS` to store the replay files locally.

If using `PREFERRED_STORAGE_TYPE` = `S3`, then you need to provide the following:
- `AWS_S3_REGION` is the AWS region the bucket is in (e.g. eu-central-1), if using S3 as a preferred storage type.
- `AWS_S3_BUCKET_NAME` is the name of the S3 bucket, if using S3 as a preferred storage type.
- `AWS_ACCESS_KEY_ID` is the AWS Access Key ID of your IAM user with S3 access, if using S3 as a preferred storage type.
- `AWS_SECRET_ACCESS_KEY` is the AWS Access Key value of your IAM user with S3 access, if using S3 as a preferred storage type.

## Running the server locally

Having set everything up, you can start the server using `npm run dev`. The server will run on port `80` by default (you can override this port by setting `HTTP_PORT` in `.env`).

## AWS SAM

The server is also available as a AWS Lambda function, AWS SAM is a tool that allows you to easily deploy the server as a function. The AWS SAM template is located in `server/template.yml`.

Note: to run any AWS SAM commands locally, you need to have the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) and [Docker](https://docs.docker.com/get-docker/) installed.

Deployment is done by running `sam build` and `sam deploy` using the correct parameters. In practice, these commands should never need to be run manually apart from the first deploy, which is why these parameters are not included here. All following deployments are done using GitHub actions, so if you want to find the parameters to build and deploy, check out the `sam-build.yml` and `sam-deploy.yml` GitHub actions.

## Deployment

Every commit on `main` is being deployed to the production server - there's currently no preview API that can be used to verify changes.
