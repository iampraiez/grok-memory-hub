# Grok Memory Hub - Backend

The backend service for Grok Memory Hub, built with Fastify, Prisma, and TypeScript. It provides a robust API for chat interactions, memory management, and RAG (Retrieval-Augmented Generation) capabilities.

## 🚀 Tech Stack

-   **Framework**: [Fastify](https://www.fastify.io/) - High-performance web framework.
-   **Language**: TypeScript - Type-safe JavaScript.
-   **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/)).
-   **Authentication**: [Clerk](https://clerk.com/) - User management and authentication.
-   **LLM Integration**: [OpenRouter](https://openrouter.ai/) - Access to various LLMs (e.g., DeepSeek, Grok).
-   **Embeddings**: `fastembed` - Local embedding generation for RAG.
-   **Validation**: `zod` - Schema validation.
-   **Deployment**: Docker & Render.

## 🛠️ Setup & Installation

### Prerequisites
-   Node.js >= 20
-   pnpm (recommended) or npm
-   PostgreSQL database
-   Clerk account
-   OpenRouter API key

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory based on `.env.example`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/grok_memory_hub"

# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenRouter (LLM)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=tngtech/deepseek-r1t2-chimera
```

### 3. Database Setup
Run Prisma migrations to set up your database schema:

```bash
pnpm prisma generate
pnpm prisma db push
```

### 4. Run Locally
Start the development server:

```bash
pnpm dev
```
The server will start at `http://localhost:3001`.

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t grok-backend .
```

### Run Container
```bash
docker run -p 3001:3001 --env-file .env grok-backend
```

### Render Deployment
This project includes a `render.yaml` Blueprint for easy deployment on [Render](https://render.com/).
1.  Connect your repository to Render.
2.  Select "New Blueprint Instance".
3.  Render will automatically detect the configuration.

## 🔌 API Endpoints

### Chat
-   `POST /api/chat`: Send a message and receive a streaming response. Supports attachments and web search.
-   `GET /api/chat/conversations`: List user conversations.
-   `GET /api/chat/conversations/:id`: Get messages for a specific conversation.

### Memory
-   `POST /api/memories`: Manually add a memory.
-   `GET /api/memories/search`: Search memories using vector similarity.

### System
-   `GET /health`: Health check endpoint.
