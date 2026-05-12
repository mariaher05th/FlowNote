# Frontend Setup
Frontend was created from base Vite setup.

##  Local Setup
1.  Set active directory `cd Flownote/frontend/`
2.  Install dependencies from `package.json` using `npm install` or `npm ci` for clean install
3.  Serve on localhost:5173 using `npm run dev`

## Docker Setup
0.  To apply changes, rebuild frontend image using `docker compose build frontend`
1.  Run docker compose usign `docker compose up -d`
2.  To stop and remove service use `docker compose down` and `docker rm flownote_frontend`

[`Incio`](../README.md)