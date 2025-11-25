# Grok Memory Hub

**Grok Memory Hub** is a personalized AI assistant designed to remember your conversations and context over time. It combines a powerful RAG (Retrieval-Augmented Generation) system with a modern, responsive chat interface.

## 🌟 Key Features

-   **Long-Term Memory**: Automatically stores and retrieves relevant context from past conversations.
-   **RAG Engine**: Uses vector embeddings to find the most relevant memories for every query.
-   **Web Search**: Integrated web search to provide up-to-date information.
-   **Deep Thinking**: A dedicated mode for complex problem-solving and reasoning.
-   **Multi-Modal**: Supports text and image inputs (Vision).
-   **Secure**: User authentication and data isolation via Clerk.

## 🏗️ Architecture

The project is organized as a monorepo with two main services:

-   **[Backend](./backend)**: Node.js/Fastify server handling API requests, vector storage (Postgres + pgvector), and LLM orchestration.
-   **[Frontend](./frontend)**: React/Vite application providing the user interface.

## 🚀 Quick Start

### Prerequisites
-   Node.js >= 20
-   pnpm
-   Docker (optional, for deployment)
-   PostgreSQL database

### Manual Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/grok-memory-hub.git
    cd grok-memory-hub
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    pnpm install
    # Configure .env (see backend/README.md)
    pnpm prisma generate
    pnpm dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    pnpm install
    # Configure .env (see frontend/README.md)
    pnpm dev
    ```

4.  **Access the App**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🐳 Docker Support

The backend is fully containerized and ready for deployment.
See [backend/README.md](./backend/README.md) for Docker instructions.

## 📄 License

This project is licensed under the MIT License.
