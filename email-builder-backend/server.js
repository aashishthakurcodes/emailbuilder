const express = require('express');
const mongoose = require('mongoose');
const emailTemplateRoutes = require('./routes/emailTemplateRoutes');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type'], // Allowed headers
}));

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/email-builder')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Use routes
app.use('/api', emailTemplateRoutes);

// Serve static files from the frontend's dist folder
const frontendPath = path.resolve(__dirname, '..', 'email-builder-frontend', 'dist');
app.use(express.static(frontendPath));

// Serve index.html for all other routes (handle frontend routing)
app.get('*', (_, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


// Start the server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
