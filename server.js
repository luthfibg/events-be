const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router('db.json');

// Custom middleware to serve static files
const serveStatic = require('serve-static');
server.use(serveStatic(path.join(__dirname, 'public')));

// Default middlewares (CORS enabled)
server.use(jsonServer.defaults());

// Routes
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server with static files is running on port ${PORT}`);
});