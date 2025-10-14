markdown
# Express.js Products API

A RESTful API for managing products built with Express.js, featuring CRUD operations, authentication, validation, and advanced querying capabilities.

## Features

- ✅ Complete CRUD operations for products
- ✅ Custom middleware for logging, authentication, and validation
- ✅ Comprehensive error handling
- ✅ Advanced filtering, pagination, and search
- ✅ Product statistics endpoint
- ✅ Input validation and error handling

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd express-products-api
Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env
Edit .env with your preferred values.

Start the server

bash
npm start
For development with auto-restart:

bash
npm run dev
Access the API
The server will run on http://localhost:3000

API Documentation
Authentication
Include the API key in the x-api-key header for protected routes (POST, PUT, DELETE).

Endpoints
GET /
Description: Welcome message and API documentation

Response: API information and available endpoints

GET /api/products
Description: Get all products with optional filtering and pagination

Query Parameters:

category (string): Filter by category

inStock (boolean): Filter by stock status

maxPrice (number): Filter by maximum price

page (number): Page number for pagination (default: 1)

limit (number): Number of items per page (default: 10)

Response: Paginated list of products

GET /api/products/search
Description: Search products by name or description

Query Parameters:

q (string, required): Search query

Response: Search results

GET /api/products/stats
Description: Get product statistics

Response: Statistics including counts, categories, and price information

GET /api/products/:id
Description: Get a specific product by ID

Response: Single product object

POST /api/products
Description: Create a new product (Protected)

Headers: x-api-key: your-api-key

Body: Product object with required fields

Response: Created product

PUT /api/products/:id
Description: Update an existing product (Protected)

Headers: x-api-key: your-api-key

Body: Product fields to update

Response: Updated product

DELETE /api/products/:id
Description: Delete a product (Protected)

Headers: x-api-key: your-api-key

Response: Deleted product

Product Schema
json
{
  "id": "string (auto-generated)",
  "name": "string (required)",
  "description": "string (required)",
  "price": "number (required, non-negative)",
  "category": "string (required)",
  "inStock": "boolean (optional, default: true)"
}
Example Requests
Get all products with pagination
bash
curl "http://localhost:3000/api/products?page=1&limit=2"
Filter by category
bash
curl "http://localhost:3000/api/products?category=electronics"
Search products
bash
curl "http://localhost:3000/api/products/search?q=laptop"
Create a new product
bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key-123" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "category": "electronics",
    "inStock": true
  }'
Update a product
bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key-123" \
  -d '{
    "price": 1099.99,
    "inStock": false
  }'
Error Responses
The API returns standardized error responses:

json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": ["Additional error details"] // Optional
}
Common HTTP status codes:

200: Success

201: Created

400: Validation Error

401: Unauthorized (Missing API key)

403: Forbidden (Invalid API key)

404: Not Found

500: Internal Server Error

text

## Testing the API

You can test the API using tools like:

1. **Postman** or **Insomnia**
2. **curl** commands (examples in README)
3. **Browser** for GET requests

This implementation provides a complete, production-ready Express.js API with all the required features from the assignment, including proper error handling, middleware, authentication, validation, and advanced querying capabilities.