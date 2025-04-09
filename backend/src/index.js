require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import routes
const whaleRoutes = require('./routes/whaleRoutes');
const alertRoutes = require('./routes/alertRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sonar', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'SONAR API - AI Intelligence Officer for Blockchain Transactions',
    version: '0.1.0',
    status: 'running'
  });
});

// Routes
app.use('/api/whales', whaleRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 