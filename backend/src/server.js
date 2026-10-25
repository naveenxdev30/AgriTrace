require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const productRoutes = require('./routes/productRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const traceRoutes = require('./routes/traceRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AgriTrace API Service',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/trace', traceRoutes);
app.use('/api/stats', statsRoutes);

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource or endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌾 AgriTrace Backend API Service running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`📦 Health:   http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
