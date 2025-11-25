# Grok Memory Hub - Frontend

The frontend application for Grok Memory Hub, a modern chat interface built with React, Vite, and TailwindCSS. It features a responsive design, markdown rendering, and real-time streaming responses.

## 🚀 Tech Stack

-   **Framework**: [React](https://react.dev/) (v19)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com/) (v4)
-   **Authentication**: [Clerk](https://clerk.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Markdown**: `react-markdown`, `react-syntax-highlighter`
-   **Notifications**: `react-hot-toast`

## 🛠️ Setup & Installation

### Prerequisites
-   Node.js >= 20
-   pnpm (recommended) or npm

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the `frontend` directory based on `.env.example`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001/api
```

### 3. Run Locally
Start the development server:

```bash
pnpm dev
```
The app will be available at `http://localhost:5173`.

## ✨ Features

-   **Real-time Chat**: Streaming responses from the backend with low latency.
-   **Markdown Support**: Renders code blocks, tables, and rich text.
-   **Memory Integration**: Visual indicators for memory usage (`@memory` command).
-   **Web Search**: Toggleable web search capability.
-   **Deep Thinking**: "Think" mode for complex reasoning tasks.
-   **Responsive Design**: Mobile-friendly interface with a floating navbar.
-   **Toast Notifications**: Graceful error handling and user feedback.

## 📦 Build for Production

To create a production build:

```bash
pnpm build
```
The output will be in the `dist` directory, ready to be served by Nginx or any static file server.
