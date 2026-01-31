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
  ]
};

// Get all products
module.exports = (req, res) => {
  if (req.method === 'GET') {
    console.log('GET /api/products - Returning', db.products.length, 'products');
    res.status(200).json(db.products);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
