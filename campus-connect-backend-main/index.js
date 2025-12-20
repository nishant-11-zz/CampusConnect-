require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const studyHubRoutes = require('./routes/studyHubRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middlewares
const { apiLimiter, aiLimiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Updated to 5173
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/auth/', authLimiter);

// Serve generated voice files
app.use('/voices', express.static(path.join(__dirname, 'voices')));

// ---------- HEALTH CHECK (BEFORE ALL ROUTES) ----------
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ---------- ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/studyhub', studyHubRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ answer: 'Route not found. Try /api/ai or /api/studyhub' });
});

// ---------- ERROR HANDLER ----------
app.use(errorHandler);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
// Use 127.0.0.1 instead of localhost for Windows node 17+
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mmmut-ai';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    startServer();
  })
  .catch(err => {
    console.error('MongoDB connection error (Running in NO-DB Mode):', err.message);
    // Start server anyway for AI demo features
    startServer();
  });

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;