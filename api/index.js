const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(require.resolve('../db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

// Enable CORS
server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

module.exports = server;