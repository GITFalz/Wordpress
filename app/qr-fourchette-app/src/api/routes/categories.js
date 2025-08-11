import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const category = await prisma.category.findUnique({
            where: { id: Number(id) },
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
