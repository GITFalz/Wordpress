import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();
    
router.get('/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        userCheck(req, userid);
        const langues = await prisma.qrf_langues.findMany();
        res.status(200).json({ message: "success!", langues });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get('/:userid/:query', async (req, res) => {
    const { userid, query } = req.params;
    try {
        userCheck(req, userid);
        const langues = await prisma.qrf_langues.findMany({
            where: {
                langue: {
                    contains: query,
                    lte: 'insensitive'
                }
            }
        });
        res.status(200).json({ message: "success!", langues });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
        throw error;
    }
});

export default router;