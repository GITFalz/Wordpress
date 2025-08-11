import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    // simply return some html to render
    res.send(`
        <h1>Edit Carte</h1>
        <p>This is the edit carte page.</p>
    `);
});

export default router;