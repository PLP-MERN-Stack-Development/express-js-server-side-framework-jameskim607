// server.js - Complete Express.js Products API


// Loading environment variables 
require('dotenv').config();
// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Custom middleware and error classes
const loggerMiddleware = require('./middleware/logger');
const authMiddleware = require('./middleware/auth');
const { validateProduct, validateProductUpdate } = require('./middleware/validation');
const { NotFoundError, ValidationError } = require('./middleware/errors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(loggerMiddleware);

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  },
  {
    id: '4',
    name: 'Desk Chair',
    description: 'Ergonomic office chair',
    price: 200,
    category: 'furniture',
    inStock: true
  },
  {
    id: '5',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling Bluetooth headphones',
    price: 150,
    category: 'electronics',
    inStock: true
  }
];

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API!',
    endpoints: {
      getAllProducts: 'GET /api/products',
      getProduct: 'GET /api/products/:id',
      createProduct: 'POST /api/products',
      updateProduct: 'PUT /api/products/:id',
      deleteProduct: 'DELETE /api/products/:id',
      searchProducts: 'GET /api/products/search?q=name',
      getStats: 'GET /api/products/stats'
    }
  });
});

// GET /api/products - Get all products with filtering and pagination
app.get('/api/products', (req, res, next) => {
  try {
    let filteredProducts = [...products];
    
    // Filter by category
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Filter by inStock
    if (req.query.inStock) {
      const inStock = req.query.inStock.toLowerCase() === 'true';
      filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
    }
    
    // Filter by maxPrice
    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      if (!isNaN(maxPrice)) {
        filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const result = {
      page,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
      data: filteredProducts.slice(startIndex, endIndex)
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/search - Search products by name
app.get('/api/products/search', (req, res, next) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      throw new ValidationError('Search query parameter "q" is required');
    }
    
    const searchResults = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    res.json({
      query: searchQuery,
      results: searchResults,
      count: searchResults.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', (req, res, next) => {
  try {
    const stats = {
      totalProducts: products.length,
      inStock: products.filter(p => p.inStock).length,
      outOfStock: products.filter(p => !p.inStock).length,
      categories: {},
      priceStats: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
        average: products.reduce((sum, p) => sum + p.price, 0) / products.length
      }
    };
    
    // Count by category
    products.forEach(product => {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product (protected route)
app.post('/api/products', authMiddleware, validateProduct, (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      category,
      inStock: Boolean(inStock)
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update an existing product (protected route)
app.put('/api/products/:id', authMiddleware, validateProductUpdate, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      throw new NotFoundError('Product not found');
    }
    
    const { name, description, price, category, inStock } = req.body;
    
    products[productIndex] = {
      ...products[productIndex],
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(inStock !== undefined && { inStock: Boolean(inStock) })
    };
    
    res.json({
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product (protected route)
app.delete('/api/products/:id', authMiddleware, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      throw new NotFoundError('Product not found');
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Not Found',
      message: error.message
    });
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      details: error.details
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: error.message || 'Something went wrong'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;