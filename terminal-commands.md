# Monorepo Terminal Commands (Guide)

All commands are intended to be run from the **root** of your project (e.g., `my-web-app/`).

## Main Development

* `npm install`
    * **What it does:** Installs all dependencies for *all* workspaces (root, `frontend`, and `backend`) into a single, top-level `node_modules` folder. Run this once after setup or after adding a new package to any workspace.

* `npm run dev`
    * **What it does:** The primary command for development. It runs the `dev` script in your root `package.json`, which in turn uses `npm-run-all` to start both the frontend (Vite) and backend (`nodemon`) servers in parallel.

## Installing Packages

* `npm install <package-name> --workspace=frontend`
    * **What it does:** Adds a new dependency (e.g., `react-router-dom`) specifically to the `frontend` workspace. It updates `frontend/package.json` and installs the package.
    * **Example:** `npm install react-router-dom --workspace=frontend`

* `npm install <package-name> --workspace=backend`
    * **What it does:** Adds a new dependency (e.g., `cors`) specifically to the `backend` workspace. It updates `backend/package.json` and installs the package.
    * **Example:** `npm install cors --workspace=backend`

* `npm install <package-name> -D --workspace=frontend`
    * **What it does:** Adds a new *dev dependency* (e.g., `eslint`) to the `frontend` workspace. The `-D` flag is short for `--save-dev`.
    * **Example:** `npm install eslint -D --workspace=frontend`

## Running Specific Scripts

* `npm run build:frontend`
    * **What it does:** A shortcut (from your root `package.json`) that runs the `build` script in the `frontend` workspace. This creates a `dist` folder with your production-ready app.

* `npm run start:backend`
    * **What it does:** A root shortcut that runs the `start` script in the `backend` workspace (i.e., `node server.js`). Use this to run the backend *without* `nodemon`.

* `npm run reset --workspace=backend`
    * **What it does:** Runs the `reset` script (i.e., `node reset.js`) from the `backend` workspace. You must specify `--workspace=backend` because this script only exists in `backend/package.json`.