# Skillspace — Angular + TypeScript Frontend

A responsive Skillspace learning landing page built with Angular standalone components, TypeScript, HTML, and CSS. It includes learning paths, responsive layouts, and a demo sign-up form.

## Requirements
- Node.js 20.19+, 22.12+, or 24+
- npm

## Run in VS Code
Run the backend and frontend in two separate VS Code terminals.

### Terminal 1: backend
```powershell
cd E:\angular-typescript-frontend\backend
npm.cmd install
# Run once to create the local environment file:
Copy-Item .env.example .env
npm.cmd start
```

The API listens on `http://127.0.0.1:3000`. Its first run creates `backend/data/signups.json`.

### Terminal 2: frontend
```powershell
cd E:\angular-typescript-frontend
npm.cmd install
npm.cmd start
```

Open `http://localhost:4200`. The Angular form sends sign-ups to the local API.

Backend settings are in `backend/.env`: `PORT` sets the API port, `FRONTEND_ORIGIN` sets the allowed frontend origin for local requests, and `SIGNUPS_FILE` sets the local JSON file path. If you change `PORT`, also update `signupApiUrl` in `src/app/app.component.ts` to use the same port.

## Customize
- Edit `src/app/app.component.html` for page structure.
- Edit `src/app/app.component.css` for component styles.
- Edit `src/app/app.component.ts` for TypeScript behavior, including the sign-up API request.
- Edit `src/styles.css` for global styles.

## Notes
- The sign-up API accepts only a name and email, validates both, and stores them locally in a JSON file. It does not collect passwords or create user accounts.
- The local JSON file contains personal information; do not use this demo storage for real users or commit the data file.
- There is no login system or AI API connection.
- This uses modern Angular with TypeScript. AngularJS (the older 1.x framework) is different from modern Angular.
