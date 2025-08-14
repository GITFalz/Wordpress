import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:userid/:key', async (req, res) => {
    const { userid, key } = req.params;

    try {
        userCheck(req, userid);

        const setting = await prisma.qrf_settings.findUnique({
            where: {
                user_id: Number(userid),
                key: key
            }
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.status(200).json(setting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:userid/:key', async (req, res) => {
    const { userid, key } = req.params;
    const { value } = req.body;

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
        });

        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:userid/:key', async (req, res) => {
    const { userid, key } = req.params;

    try {
        userCheck(req, userid);

        await prisma.qrf_settings.delete({
            where: {
                user_id: Number(userid),
                key: key
            }
        });

        res.status(200).json({ message: 'Settings deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;  