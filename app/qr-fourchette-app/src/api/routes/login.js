import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

const userSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        const parsedData = userSchema.parse({ email, password });

        const user = await prisma.qrf_users.findUnique({
            where: { email: parsedData.email },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(parsedData.password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user.id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;