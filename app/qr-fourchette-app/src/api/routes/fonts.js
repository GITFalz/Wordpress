import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        userCheck(req, userid); // check if a user is connected, no outside access
        const fonts = await prisma.qrf_fonts.findMany({ take: 50 });
        res.json(fonts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:userid/:query', async (req, res) => {
    const { userid, query } = req.params;
    try {
        userCheck(req, userid); // check if a user is connected, no outside access
       const fonts = await prisma.qrf_fonts.findMany({
        where: {
            name: {
                contains: query,
            },
        },
        take: 20,
        });
        res.json(fonts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:userid/font/:fontid', async (req, res) => {
    const { userid, fontid } = req.params;
    try {
        userCheck(req, userid); // check if a user is connected, no outside access
        const font = await prisma.qrf_fonts.findUnique({
            where: {
                id: Number(fontid),
            },
        });
        res.json(font);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;