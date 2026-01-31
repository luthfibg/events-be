const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'https://gandrung-events.vercel.app', // Allow specific origin for Vercel frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from 'public' folder and subfolders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/customers', express.static(path.join(__dirname, 'public/customers')));
app.use('/gallery', express.static(path.join(__dirname, 'public/gallery')));
app.use('/products', express.static(path.join(__dirname, 'public/products')));

// Load database
let db = { products: [], orders: [] };

// Load data from db.json
async function loadData() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    db = JSON.parse(data);
    console.log('Database loaded successfully');
  } catch (error) {
    console.log('Could not load db.json, using empty database');
  }
}

// Save data to db.json
async function saveData() {
  try {
    await fs.writeFile(
      path.join(__dirname, 'db.json'),
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize data
loadData();

// ========== API ROUTES ==========

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Gandrung Events API is running!',
    version: '1.0.0',
    endpoints: {
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      orders: 'GET /api/orders',
      health: 'GET /api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'gandrung-events-api'
  });
});

// ========== PRODUCTS API ==========

// Get all products
app.get('/api/products', (req, res) => {
  console.log('GET /api/products - Returning', db.products.length, 'products');
  res.json(db.products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = db.products.find(p => 
    p.id.toString() === id.toString() || p.id == id
  );
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Create new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = {
      id: Date.now(), // Simple ID generation
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    db.products.push(newProduct);
    await saveData();
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const index = db.products.findIndex(p => 
    p.id.toString() === id.toString() || p.id == id
  );
  
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    await saveData();
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const index = db.products.findIndex(p => 
    p.id.toString() === id.toString() || p.id == id
  );
  
  if (index !== -1) {
    db.products.splice(index, 1);
    await saveData();
    res.json({ success: true, message: 'Product deleted' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Search products
app.get('/api/products/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const results = db.products.filter(p => 
    p.title.toLowerCase().includes(query) ||
    p.type.toLowerCase().includes(query) ||
    p.specifications.toLowerCase().includes(query)
  );
  
  res.json(results);
});

// ========== ORDERS API ==========

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(db.orders || []);
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    db.orders.push(newOrder);
    await saveData();
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requested: req.originalUrl,
    availableEndpoints: ['/', '/api/products', '/api/orders', '/api/health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// For Vercel: export the app wrapped with serverless-http
const serverless = require('serverless-http');
module.exports = serverless(app);

// For local development: start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    console.log(`🛍️  Products endpoint: http://localhost:${PORT}/api/products`);
  });
}
