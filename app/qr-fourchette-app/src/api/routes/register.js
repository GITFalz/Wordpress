import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

const userSchema = z.object({
    username: z.string().min(1, "User login is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

router.post('/', async (req, res) => {
    try {
        const parsedData = userSchema.parse(req.body);
        const user = await prisma.qrf_users.findUnique({
            where: { email: parsedData.email },
        });

        if (user) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(parsedData.password, 10);
        const newUser = await prisma.qrf_users.create({
            data: {
                username: parsedData.username,
                email: parsedData.email,
                password_hash: hashedPassword
            }
        });

        const safeUser = {
            ...newUser,
            id: newUser.id.toString(),
        };

        res.status(201).json(safeUser);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;