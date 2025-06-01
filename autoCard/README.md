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

### Product Endpoints

Manages product information, including inventory and pricing. All product endpoints are prefixed with `/api/v1/products`.

#### 1. Create Product

*   **Method:** `POST`
*   **URL:** `/`
*   **Description:** Creates a new product.
*   **Request Body Example:**
    ```json
    {
      "name": "Super Widget",
      "description": "The best widget in the market.",
      "price": 29.99,
      "category": "Widgets", // Optional, default: 'General'
      "stock": 100, // Optional, default: 0
      "sku": "WDGT-SPR-001" // Optional, unique
    }
    ```
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d1f1a5c1b2c3a4d5e6f7g8",
        "name": "Super Widget",
        "description": "The best widget in the market.",
        "price": 29.99,
        "category": "Widgets",
        "stock": 100,
        "sku": "WDGT-SPR-001",
        "createdAt": "2023-02-01T10:00:00.000Z",
        "updatedAt": "2023-02-01T10:00:00.000Z"
      }
    }
    ```
*   **Error Response Example (400 Bad Request - Validation Error):**
    ```json
    {
      "success": false,
      "error": ["Product name is required.", "Price cannot be negative."]
    }
    ```

#### 2. Get All Products

*   **Method:** `GET`
*   **URL:** `/`
*   **Description:** Retrieves a list of all products. Supports pagination and filtering.
*   **Query Parameters:**
    *   `page` (number, optional): Page number for pagination (e.g., `1`).
    *   `limit` (number, optional): Number of items per page (e.g., `10`).
    *   `category` (string, optional): Filter by product category.
    *   `name` (string, optional): Filter by product name (case-insensitive, partial match).
*   **Success Response Example (200 OK):** (Similar structure to Get All Cards, showing product data)
    ```json
    {
      "success": true,
      "count": 1,
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalProducts": 1
      },
      "data": [
        {
          "_id": "60d1f1a5c1b2c3a4d5e6f7g8",
          "name": "Super Widget",
          // ... other product fields
        }
      ]
    }
    ```

#### 3. Get Product by ID

*   **Method:** `GET`
*   **URL:** `/:productId`
*   **Description:** Retrieves a specific product by its unique ID.
*   **Success Response Example (200 OK):** (Similar to Get Card by ID, showing product data)

#### 4. Update Product

*   **Method:** `PUT`
*   **URL:** `/:productId`
*   **Description:** Updates an existing product by its ID.
*   **Request Body Example:**
    ```json
    {
      "price": 32.99,
      "stock": 90
    }
    ```
*   **Success Response Example (200 OK):** (Similar to Update Card, showing updated product data)

#### 5. Delete Product

*   **Method:** `DELETE`
*   **URL:** `/:productId`
*   **Description:** Deletes a product by its ID.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product deleted successfully"
    }
    ```

### Address Endpoints

Manages address information. All address endpoints are prefixed with `/api/v1/addresses`.

#### 1. Create Address

*   **Method:** `POST`
*   **URL:** `/`
*   **Description:** Creates a new address.
*   **Request Body Example:**
    ```json
    {
      "street": "123 Maple Drive",
      "apartmentOrSuite": "Unit 5B", // Optional
      "city": "Springfield",
      "stateOrProvince": "IL",
      "country": "USA",
      "postalCode": "62704",
      "addressType": "home", // Optional, default: 'home'. Enum: ['home', 'work', 'other']
      "isDefault": false // Optional, default: false
    }
    ```
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d2f2b6d1c2d3e4f5g6h7i8",
        "street": "123 Maple Drive",
        // ... other address fields
      }
    }
    ```

#### 2. Get All Addresses

*   **Method:** `GET`
*   **URL:** `/`
*   **Description:** Retrieves a list of all addresses. Supports pagination and filtering.
*   **Query Parameters:**
    *   `page` (number, optional): Page number.
    *   `limit` (number, optional): Items per page.
    *   `city` (string, optional): Filter by city (case-insensitive).
    *   `postalCode` (string, optional): Filter by postal code.
*   **Success Response Example (200 OK):** (Similar structure to Get All Cards, showing address data)

#### 3. Get Address by ID

*   **Method:** `GET`
*   **URL:** `/:addressId`
*   **Description:** Retrieves a specific address by ID.

#### 4. Update Address

*   **Method:** `PUT`
*   **URL:** `/:addressId`
*   **Description:** Updates an existing address.
*   **Request Body Example:**
    ```json
    {
      "street": "456 Oak Avenue",
      "isDefault": true
    }
    ```

#### 5. Delete Address

*   **Method:** `DELETE`
*   **URL:** `/:addressId`
*   **Description:** Deletes an address by ID.

### Habit Endpoints

Manages habits and tracks their completion. All habit endpoints are prefixed with `/api/v1/habits`.

#### 1. Create Habit

*   **Method:** `POST`
*   **URL:** `/`
*   **Description:** Creates a new habit.
*   **Request Body Example:**
    ```json
    {
      "name": "Morning Meditation",
      "description": "Meditate for 10 minutes every morning.",
      "frequency": "daily", // Enum: ['daily', 'weekly', 'monthly', 'specific_days']
      "daysOfWeek": [], // Optional, relevant if frequency is 'specific_days'. E.g. ["Monday", "Wednesday"]
      "goal": "10 minutes"
    }
    ```
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d3f3c7e1d2e3f4g5h6i7j8",
        "name": "Morning Meditation",
        "currentStreak": 0,
        "longestStreak": 0,
        // ... other habit fields
      }
    }
    ```

#### 2. Get All Habits

*   **Method:** `GET`
*   **URL:** `/`
*   **Description:** Retrieves a list of all habits. Supports pagination and filtering.
*   **Query Parameters:**
    *   `page` (number, optional): Page number.
    *   `limit` (number, optional): Items per page.
    *   `frequency` (string, optional): Filter by frequency (e.g., `daily`, `weekly`).
    *   `name` (string, optional): Filter by name (case-insensitive, partial match).
*   **Success Response Example (200 OK):** (Similar structure to Get All Cards, showing habit data)

#### 3. Get Habit by ID

*   **Method:** `GET`
*   **URL:** `/:habitId`
*   **Description:** Retrieves a specific habit by ID.

#### 4. Update Habit

*   **Method:** `PUT`
*   **URL:** `/:habitId`
*   **Description:** Updates an existing habit. Can also be used to mark a habit as complete and update streaks.
*   **Request Body Example (General Update):**
    ```json
    {
      "description": "Meditate for 15 minutes every morning upon waking.",
      "goal": "15 minutes"
    }
    ```
*   **Request Body Example (Marking Complete):**
    To mark a habit as complete and update its streak, send:
    ```json
    {
      "markComplete": true
    }
    ```
    The server will update `lastCompletedDate`, `currentStreak`, and `longestStreak` accordingly.
*   **Success Response Example (200 OK):** (Shows updated habit data, including potentially updated streaks)

#### 5. Delete Habit

*   **Method:** `DELETE`
*   **URL:** `/:habitId`
*   **Description:** Deletes a habit by ID.

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
