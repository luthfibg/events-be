const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'https://gandrung-events.vercel.app', // Allow specific origin for Vercel frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// In-memory database for Vercel serverless environment
let db = {
  products: [
    {
      id: 1,
      title: "Upad IV Unilumin",
      type: "led display",
      specifications: "P3.9, 500x500mm, 1920Hz, 5500nits, 3840Hz",
      rent: 100000,
      image: "https://events-be-indol.vercel.app/uploads/upadIV.webp"
    },
    {
      id: 2,
      title: "Uslim III Unilumin",
      type: "led display",
      specifications: "P2.5, 500x1000mm, 1920Hz, 7500nits, 3840Hz",
      rent: 150000,
      image: "https://events-be-indol.vercel.app/uploads/uslimIII.webp"
    },
    {
      id: "3",
      title: "Samsung 60inch TV",
      type: "tv",
      specifications: "60inch, 4K UHD, Smart TV",
      rent: 50000,
      image: "https://events-be-indol.vercel.app/uploads/tv60.jpg"
    }
  ],
  orders: []
};

// ========== API ROUTES ==========

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Gandrung Events API is running!',
    version: '1.0.0',
    endpoints: {
      products: {
        getAll: 'GET /products',
        getById: 'GET /products/:id',
        create: 'POST /products',
        update: 'PUT /products/:id',
        delete: 'DELETE /products/:id'
      },
      orders: 'GET /orders',
      health: 'GET /health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'gandrung-events-api'
  });
});

// ========== PRODUCTS API ==========

// Get all products
app.get('/products', (req, res) => {
  console.log('GET /products - Returning', db.products.length, 'products');
  res.json(db.products);
});

// Get product by ID
app.get('/products/:id', (req, res) => {
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
app.post('/products', async (req, res) => {
  try {
    const newProduct = {
      id: Date.now(), // Simple ID generation
      ...req.body,
      createdAt: new Date().toISOString()
    };

    db.products.push(newProduct);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const index = db.products.findIndex(p =>
    p.id.toString() === id.toString() || p.id == id
  );

  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  const index = db.products.findIndex(p =>
    p.id.toString() === id.toString() || p.id == id
  );

  if (index !== -1) {
    db.products.splice(index, 1);
    res.json({ success: true, message: 'Product deleted' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Search products
app.get('/products/search/:query', (req, res) => {
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
app.get('/orders', (req, res) => {
  res.json(db.orders || []);
});

// Create new order
app.post('/orders', async (req, res) => {
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

// Export for Vercel
module.exports = app;
