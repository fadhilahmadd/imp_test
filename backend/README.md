Backend Post Management. It is built with Hono.js, uses PostgreSQL for the database (via Prisma ORM), and provides a complete, self-documenting JSON API for authentication and post management.

## Tech Stack

* **Framework**: [Hono.js](https://hono.dev/) on Node.js
* **Database**: PostgreSQL
* **ORM**: [Prisma](https://www.prisma.io/)
* **Authentication**: JWT (JSON Web Tokens) stored in `httpOnly` cookies
* **Validation**: [Zod](https://zod.dev/)
* **API Documentation**: [Swagger/OpenAPI](https://swagger.io/) via `@hono/zod-openapi`
* **TypeScript**: End-to-end type safety
* **Containerization**: Docker & Docker Compose

## Features

* **Authentication**:
    * `POST /api/auth/signup`: Create a new user account.
    * `POST /api/auth/signin`: Log in a user and set an `httpOnly` auth cookie.
    * `POST /api/auth/signout`: Clear the auth cookie to log out.
    * `GET /api/auth/me`: Get the currently authenticated user's details (protected).
* **Post Management (CRUD)**:
    * `GET /api/posts`: List all posts with pagination (e.g., `?page=1&limit=10`).
    * `POST /api/posts`: Create a new post (protected).
    * `GET /api/posts/{id}`: Get details for a single post.
    * `PATCH /api/posts/{id}`: Update an existing post (protected, author only).
    * `DELETE /api/posts/{id}`: Delete a post (protected, author only).
* **API Documentation**:
    * `GET /api/doc`: Serves an interactive Swagger UI (development only).
    * `GET /api/openapi.json`: Serves the raw OpenAPI 3.0 spec.

---

## How to Install and Run (Docker - Recommended)

This is the fastest way to get the application and database running.

### 1. Prerequisites

* [Docker](https://www.docker.com/products/docker-desktop/)
* [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

### 2. Set Up Environment Variables

1.  **Copy `.env.example` to `.env`:**
    ```bash
    cp .env.example .env
    ```
    *(If `.env` already exists, ensure it has the necessary variables shown below)*.

2.  **Edit the `.env` file:**
    * Set a strong, unique `JWT_SECRET`.
    * **Review/update the `POSTGRES_` variables** if you want to change the default database credentials (`postgres`/`postgres`/`mydb`). The `DATABASE_HOST` should remain `localhost` for the dynamic setup to work.
    * Ensure `PORT` and `DB_PORT` are set correctly (defaults are usually fine).

    ```dotenv
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres # CHANGE TO A STRONG PASSWORD
    POSTGRES_DB=mydb
    DB_PORT=5432
    DATABASE_HOST=localhost # Default host for local runs, overridden by Docker Compose for container runs

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DATABASE_HOST}:${DB_PORT}/${POSTGRES_DB}?schema=public"

    JWT_SECRET="your-super-secret-key" # SET THIS SECURELY
    PORT=8000
    ```

### 3. Build and Run

Run the following command to build the Docker images and start the `backend` and `db` services in the background:

```bash
docker compose up -d --build
````

### 4\. Run Database Migration

With the containers running, execute the Prisma migration inside the `backend` container:

```bash
docker compose exec backend npm run db:migrate
```

Your server is now running at **[http://localhost:8000](https://www.google.com/search?q=http://localhost:8000)**.

-----

## How to Install and Run (Manual/Local)

Use this method if you want to run the Node.js server and database directly on your host machine.

### 1\. Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or later recommended)
  * [npm](https://www.npmjs.com/) (usually included with Node.js)
  * A running [PostgreSQL](https://www.postgresql.org/) database.

### 2\. Installation

1.  **Clone the repository** (or ensure you are in the `backend` directory):

    ```bash
    # git clone https://github.com/fadhilahmadd/imp_test.git
    cd backend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file. You can use `.env.example` as a template, but you **must** provide the full `DATABASE_URL` yourself (renamed to `LOCAL_DATABASE_URL` in the example).

    ```.env
    POSTGRES_USER=your_local_db_user
    POSTGRES_PASSWORD=your_local_db_password
    POSTGRES_DB=your_local_db_name
    DB_PORT=5432
    DATABASE_HOST=localhost # Default is correct for local

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DATABASE_HOST}:${DB_PORT}/${POSTGRES_DB}?schema=public"

    JWT_SECRET="your-super-secret-key" # Set securely
    PORT=8000
    ```

### 3\. Database Migration

Before starting the server, apply the database schema:

```bash
npm run db:migrate
```

### 4\. Running the Server

  * **For development (with hot-reloading)**:

    ```bash
    npm run dev
    ```

    The server will be available at `http://localhost:8000`.

  * **For production**:

    ```bash
    npm run build
    npm run start
    ```

-----

## API Documentation (Swagger)

In **development mode** (`npm run dev`), an interactive Swagger UI is hosted at:

**[http://localhost:8000/api/doc](https://www.google.com/search?q=http://localhost:8000/api/doc)** (Adjust port if changed)

This documentation is generated automatically from the code and Zod schemas. It is disabled in production.

### Note on Protected Routes & Cookies

The API uses secure `httpOnly` cookies for authentication. Swagger UI cannot automatically manage these cookies. To test protected endpoints (POST/PATCH/DELETE posts, GET /me) in Swagger:

1.  Log in using your actual frontend application first. This sets the cookie in your browser.
2.  Open the Swagger UI in *the same browser*. The browser will automatically send the cookie with your requests from Swagger.

-----

### Reasoning Behind Choices

1.  **Hono.js**: Fast, lightweight, familiar middleware pattern.
2.  **Prisma**: Excellent type safety for database interactions.
3.  **httpOnly Cookies**: Secure way to handle JWTs, mitigating XSS risks.
4.  **Zod + `@hono/zod-openapi`**: Single source of truth for validation and API documentation.
5.  **Separation of Concerns**: Modular structure (routes, middleware, lib) enhances maintainability.
6.  **Owner-Only Authorization**: Ensures users can only modify their own posts.