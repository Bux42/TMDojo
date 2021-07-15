# TMDojo Server

This is the TMDojo back-end - based on Express.js.

## Setup

First, install the app's dependencies using `npm install`.

### Configuration

Use the `.env.template` to create your own `.env` - this is the main configuration file for the application.

- `USE_CERTIFICATES` is used to toggle SSL certificates - unless you're debugging this, you shouldn't need it during local development.
- `MONGO_URL` is the connection URL for the database - for local development we suggest running a MongoDB instance on your own system (you might have to manually create a `dojo` database).

### Running the Server

Having set everything up, you can start the server using `npm start`. The server will run on port `80`.

## Deployment

Every commit on `main` is being deployed to the production server - there's currently no preview API that can be used to verify changes.
