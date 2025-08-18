import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Middleware to check user once
router.use('/:userid', (req, res, next) => {
    try {
        userCheck(req, req.params.userid);
        next();
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        return res.status(statusCode).json({ error: error.message });
    }
});

// GET one setting
router.get('/:userid/:key', async (req, res) => {
    const { userid, key } = req.params;
    try {
        const setting = await prisma.qrf_settings.findUnique({
            where: { key_user_id: { user_id: Number(userid), key } }, // composite unique
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.json({ [setting.key]: setting.value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:userid', async (req, res) => {
    const { userid } = req.params;
    const { key, value, keys } = req.body;

    try {
        if (key && value !== undefined) {
            // Single setting
            await prisma.qrf_settings.upsert({
                where: { key_user_id: { user_id: Number(userid), key } },
                update: { value },
                create: { user_id: Number(userid), key, value },
            });
            return res.status(201).json({ message: 'Setting created/updated successfully' });
        } else if (Array.isArray(keys)) {
            // Multiple settings
            const settings = await Promise.all(
                keys.map(async (k) => {
                    let setting = await prisma.qrf_settings.findUnique({
                        where: { key_user_id: { user_id: Number(userid), key: k } },
                    });
                    if (!setting) {
                        setting = await prisma.qrf_settings.create({
                            data: { user_id: Number(userid), key: k, value: '' },
                        });
                    }
                    return setting;
                })
            );

            const serialized = settings.reduce((acc, s) => {
                acc[s.key] = s.value;
                return acc;
            }, {});

            return res.json({ message: 'success', settings: serialized });
        } else {
            return res.status(400).json({ error: 'Invalid request body' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update or create one setting
router.put('/:userid/:key/:value', async (req, res) => {
    const { userid, key, value } = req.params;

    try {
        await prisma.qrf_settings.upsert({
            where: { key_user_id: { user_id: Number(userid), key } },
            update: { value },
            create: { user_id: Number(userid), key, value },
        });

        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE one setting
router.delete('/:userid/:key', async (req, res) => {
    const { userid, key } = req.params;

    try {
        await prisma.qrf_settings.delete({
            where: { key_user_id: { user_id: Number(userid), key } },
        });

        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Setting not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
