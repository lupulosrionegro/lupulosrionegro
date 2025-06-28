# ESP32-Firebase-LRN Web Frontend

This directory contains the web frontend for the ESP32-Firebase-LRN project, built with React and Vite.

## Deployment to Vercel

To deploy this application to Vercel, follow these steps:

1.  **Install Vercel CLI:**
    ```bash
    npm install -g vercel
    ```

2.  **Navigate to the `web` directory:**
    ```bash
    cd web
    ```

3.  **Deploy:**
    ```bash
    vercel
    ```

    Follow the prompts to link your project and deploy. Vercel will automatically detect the `vercel.json` configuration and deploy the React application from the `frontend` directory.

## Local Development

To run the application locally:

1.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).