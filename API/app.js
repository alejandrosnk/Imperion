// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
