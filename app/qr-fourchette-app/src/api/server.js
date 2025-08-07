import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import registerRoutes from './routes/register.js';
import loginRoutes from './routes/login.js';

const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
