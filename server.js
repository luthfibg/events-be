const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Enable CORS for all routes
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from 'public' directory
// This makes files in 'public' folder accessible at root URL
server.use(express.static(path.join(__dirname, 'public')));

// Alternative: Serve specific folders at specific paths
// server.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// server.use('/products', express.static(path.join(__dirname, 'public/products')));
// server.use('/customers', express.static(path.join(__dirname, 'public/customers')));

// Use default middlewares (logger, static, cors, etc.)
server.use(middlewares);

// Use json-server router for API endpoints
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'public')}`);
});