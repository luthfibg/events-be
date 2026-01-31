const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// 1. First, set CORS headers for ALL requests
server.use((req, res, next) => {
  // Allow from any origin (or specify your frontend URL)
  const allowedOrigins = [
    'https://gandrung-events.vercel.app',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000'  // React dev server
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 2. Use json-server middlewares (includes static file serving)
server.use(middlewares);

// 3. Use json-server router
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`CORS enabled for frontend: https://gandrung-events.vercel.app`);
});