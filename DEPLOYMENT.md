# Deployment Guide

This project deploys cleanly as three services:

- `smartcart-client`: React/Vite static site
- `smartcart-express-api`: Express API and MongoDB persistence
- `smartcart-ml-api`: Flask ML service for pandas/sklearn/model files

## Recommended host: Render

A `render.yaml` blueprint is included at the repository root. Render requires this file at the Git repository root for Blueprint deployments.

## Before deploying

1. Push the full `smartcart_mern` folder to GitHub.
2. Make sure these folders are committed:
   - `client/`
   - `server/`
   - `ml-api/`
   - `models/`
   - `data/`
3. Do not commit real `.env` files.
4. Keep `.env.example` files committed.

## Render Blueprint deployment

1. Open Render Dashboard.
2. Choose **New > Blueprint**.
3. Connect the GitHub repo that contains `render.yaml`.
4. Render will create three services.
5. When prompted for secret values, add:

### `smartcart-express-api`

```text
MONGO_URI=<your MongoDB Atlas connection string>
CLIENT_ORIGIN=<your deployed frontend URL>
```

Example:

```text
CLIENT_ORIGIN=https://smartcart-client.onrender.com
```

### `smartcart-client`

```text
VITE_API_BASE_URL=<your deployed Express API URL>/api
```

Example:

```text
VITE_API_BASE_URL=https://smartcart-express-api.onrender.com/api
```

## Important deployment order

Render may ask for `CLIENT_ORIGIN` and `VITE_API_BASE_URL` before the final service URLs are obvious.

Use this flow if needed:

1. Deploy once with placeholder URLs.
2. Copy the final Render URLs from each service page.
3. Update environment variables:
   - client `VITE_API_BASE_URL`
   - server `CLIENT_ORIGIN`
4. Redeploy client and server.

## Health checks

After deploy, test these URLs:

```text
https://<ml-api-url>/health
https://<express-api-url>/api/health
https://<client-url>/
```

## Notes

- Flask uses `gunicorn app:app` in production.
- Express calls Flask through Render private-network variables when deployed by the blueprint.
- React calls only Express, never Flask directly.
- MongoDB Atlas must allow connections from Render. For a student/demo deployment, Atlas network access is commonly set to `0.0.0.0/0`; for production, restrict it more carefully.