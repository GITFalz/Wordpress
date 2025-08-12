import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import registerRoutes from './routes/register.js';
import loginRoutes from './routes/login.js';
import refreshTokenRoutes from './routes/refresh-token.js';
import carteRoutes from './routes/edit-carte.js';
import menuRoutes from './routes/menu.js';
import categorieRoutes from './routes/categories.js';

const app = express();
dotenv.config();

// Clean CORS configuration now that the port is public
app.use(cors({
  origin: 'https://shiny-pancake-jjj9j5754vwvhqp66-4321.app.github.dev',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'hx-request',
    'hx-trigger',
    'hx-target',
    'hx-trigger-name',
    'hx-current-url'
  ],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Body parser middleware
app.use(express.urlencoded({ extended: true })); // <-- ADD THIS
app.use(express.json());

// Test route to verify CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/register', registerRoutes); 
app.use('/api/login', loginRoutes);
app.use('/api/refresh-token', refreshTokenRoutes);
app.use('/api/edit-carte', carteRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categorie', categorieRoutes);

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});