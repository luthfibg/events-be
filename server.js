const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
  static: 'public',
  noCors: false
});

// Enable CORS
server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Handle preflight
server.options('*', (req, res) => {
  res.status(200).end();
});

// Use middlewares
server.use(middlewares);

// API routes
server.use('/api', router);

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
server.get('/', (req, res) => {
  res.json({
    message: 'Gandrung Events API',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      images: '/uploads/{filename}'
    }
  });
});

// Error handling
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

// Only listen if not in Vercel (Vercel handles the server)
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = server;