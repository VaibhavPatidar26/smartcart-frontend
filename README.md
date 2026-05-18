# SmartCart MERN + Flask ML

A MERN migration of the original Streamlit SmartCart customer segmentation app.

## Project layout

- `client/` - React + Vite dashboard UI
- `server/` - Express API and MongoDB persistence
- `ml-api/` - Flask API for pandas, sklearn, and pickle model inference
- `models/`, `data/`, `notebooks/` - copied from the original project and kept unchanged

## Run locally

1. Install Python 3.11+ and Node.js with a working npm.
2. Create `ml-api/.env` from `ml-api/.env.example`.
3. Create `server/.env` from `server/.env.example`. You may reuse the original Streamlit Mongo variables: `MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_CLUSTER`, and `MONGO_DB`.
4. Create `client/.env` from `client/.env.example`.
5. Install dependencies in each app folder.
6. Start Flask, then Express, then React.

```powershell
cd ml-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py

cd ..\server
npm install
npm run dev

cd ..\client
npm install
npm run dev
```

React should call Express at `http://localhost:5000`, and Express calls Flask at `http://localhost:8000`.
