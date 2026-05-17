# Frontend Setup
Frontend was created from base Vite setup.

##  Local Setup
1.  Set active directory `cd Flownote/backend/`
2.  Install dependencies from `package.json` using `npm install` or `npm ci` for clean install
3.  Init Prisma Client using `npx prisma generate` and update database with `npx prisma migrate dev`
4.  Serve on localhost:3000 using `npm run start`
5.  Check Swagger API docs on localhost:300/api 

## Docker Setup
0.  To apply changes, rebuild docker image using `docker compose build backend`
1.  Run docker compose usign `docker compose up -d`
2.  To stop and remove service use `docker compose down` and `docker rm flownote_backend`

## Database Setup
1.  To start databse from docker compose, use `docker compose up -d` and connect to port 5432.
2.  To update models and relations (database entities), modify schema.prisma and run `npx prisma migrate`
3.  To partially stop db use `docker stop flownote_db` and for removing db_data use `docker volume rm flownote_db_data`


[`Incio`](../README.md)