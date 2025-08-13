import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.put('/:userid', async (req, res) => {
    const { userid } = req.params;
    const { key, value } = req.body;

    try {
        userCheck(req, userid);

        await prisma.qrf_settings.update({
            where: {
                user_id: Number(userid),
                key: key
            },
            data: {
                value: value
            }
        })

        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;  