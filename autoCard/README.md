# autoCard API

## Description

autoCard API is a RESTful service for managing cards (tasks or items) with features like creation, retrieval, updating, deletion, pagination, filtering, and rate limiting. It's built with Node.js, Express, and MongoDB.

## Prerequisites

*   Node.js (v18.x or later recommended) and npm (or yarn)
*   MongoDB: Ensure a MongoDB instance is running. The connection string needs to be configured in a `.env` file in the project root.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd autoCard
    ```
    *(Note: In this environment, the code is already checked out in `/app/autoCard`)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the `autoCard` project root. You can copy `.env.example` (which will be created in this step) to start:
    ```bash
    cp .env.example .env
    ```
    Update the variables in `.env` with your actual configuration:
    *   `PORT`: The port the application will run on (e.g., `3001`).
    *   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/autoCardDB`).

## Running the Application

*   **Development mode (requires nodemon):**
    ```bash
    npm run dev
    ```
    *(Note: `nodemon` is listed in `package.json`'s dev script but wasn't explicitly installed as a dev dependency in previous steps. You might need to install it: `npm install --save-dev nodemon`)*

*   **Production mode:**
    ```bash
    npm start
    ```

## Running Tests

Execute the following command to run the automated tests:
```bash
npm test
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Card Management

#### 1. Create Card

*   **Method:** `POST`
*   **URL:** `/cards`
*   **Description:** Creates a new card.
*   **Request Body Example:**
    ```json
    {
      "title": "My New Task",
      "description": "Detailed description of the task.",
      "status": "todo", // Optional, default: 'todo'. Enum: ['todo', 'inprogress', 'done']
      "priority": "medium", // Optional, default: 'medium'. Enum: ['low', 'medium', 'high']
      "dueDate": "2024-12-31T00:00:00.000Z" // Optional
    }
    ```
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d0fe4f5311236168a109ca",
        "title": "My New Task",
        "description": "Detailed description of the task.",
        "status": "todo",
        "priority": "medium",
        "dueDate": "2024-12-31T00:00:00.000Z",
        "createdAt": "2023-01-01T12:00:00.000Z",
        "updatedAt": "2023-01-01T12:00:00.000Z"
      }
    }
    ```

#### 2. Get All Cards

*   **Method:** `GET`
*   **URL:** `/cards`
*   **Description:** Retrieves a list of all cards. Supports pagination and filtering.
*   **Query Parameters:**
    *   `page` (number, optional): Page number for pagination (e.g., `1`).
    *   `limit` (number, optional): Number of items per page (e.g., `10`).
    *   `status` (string, optional): Filter by status (e.g., `todo`, `inprogress`, `done`).
    *   `priority` (string, optional): Filter by priority (e.g., `low`, `medium`, `high`).
    *   `title` (string, optional): Filter by title (case-insensitive, partial match).
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "count": 1, // Number of cards in the current response
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalCards": 1 // Total number of cards matching filter
      },
      "data": [
        {
          "_id": "60d0fe4f5311236168a109ca",
          "title": "My Existing Task",
          "description": "Description here.",
          "status": "inprogress",
          "priority": "high",
          "createdAt": "2023-01-01T10:00:00.000Z",
          "updatedAt": "2023-01-01T11:00:00.000Z"
        }
      ]
    }
    ```

#### 3. Get Card by ID

*   **Method:** `GET`
*   **URL:** `/cards/:cardId`
*   **Description:** Retrieves a specific card by its unique ID.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d0fe4f5311236168a109ca",
        "title": "Specific Task",
        // ... other fields
      }
    }
    ```

#### 4. Update Card

*   **Method:** `PUT`
*   **URL:** `/cards/:cardId`
*   **Description:** Updates an existing card by its ID.
*   **Request Body Example:**
    ```json
    {
      "title": "Updated Task Title",
      "status": "done"
    }
    ```
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d0fe4f5311236168a109ca",
        "title": "Updated Task Title",
        "status": "done",
        // ... other fields reflect updates
      }
    }
    ```

#### 5. Delete Card

*   **Method:** `DELETE`
*   **URL:** `/cards/:cardId`
*   **Description:** Deletes a card by its ID.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Card deleted successfully"
    }
    ```

## Environment Variables

The application uses the following environment variables, which should be defined in a `.env` file in the project root (`autoCard/.env`):

*   `PORT`: The port on which the server will listen (e.g., `3001`).
*   `MONGODB_URI`: The connection URI for your MongoDB instance (e.g., `mongodb://localhost:27017/autoCardDB`).

Create your `.env` file by copying from `.env.example` and customizing the values.
```bash
cp .env.example .env
```

---
*This README was generated and provides a general template. Specific details for your repository URL or advanced setup might need adjustments.*
