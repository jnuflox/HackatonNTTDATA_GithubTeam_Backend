// Vercel serverless function entry point
require('dotenv').config();
const app = require('../src/server');

// Export for Vercel serverless
module.exports = app;
