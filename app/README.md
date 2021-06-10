# TMDojo App

This is the TMDojo front-end - based on React.js and Next.js.

## Setup

First, install the app's dependencies using `npm install`.

### Configuration

Use the `.env.local.template` to create your own `.env.local` - this is the main configuration file for the application.

- `NEXT_PUBLIC_API_URL` is the API the UI is using - for local development, this should simply be `http://localhost`.
- `NEXT_PUBLIC_ANALYTICS_ID` is a Google Analytics `Mess-ID` - it's optional and intended to be used on production only.

### Running the Server

Having set everything up, you can start the development server using `npm run dev`. The server will run on port `4200`.

Pages are initially built on-demand, and then auto-refreshed when changes are detected.

## Deployment

Every commit is being deployed to a preview environment on [Vercel](https://vercel.com). Keep in mind that this is using the current `staging` API.
