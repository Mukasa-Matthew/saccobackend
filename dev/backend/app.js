const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve favicon to avoid 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root endpoint - Smart response for API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SACCO Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: 'https://github.com/Mukasa-Matthew/saccobackend'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

