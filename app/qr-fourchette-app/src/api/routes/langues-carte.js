import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        userCheck(req, userid); // may throw

        const langues = await prisma.qrf_langues_carte.findMany({
            where: { user_id: userid },
            orderBy: { number: 'asc' },
        });

        const serializedLangues = langues.map(langue => ({
            ...langue,
            id: Number(langue.id),
            user_id: Number(langue.user_id),
        }));

        res.status(200).json({ message: "success!", langues: serializedLangues });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.post('/:userid', async (req, res) => {
    const { userid } = req.params;
    const { langueData } = req.body;

    try {
        userCheck(req, userid);

        const newLangue = await prisma.qrf_langues_carte.create({
            data: {
                user_id: Number(userid),
                ...langueData
            },
        });

        const serializedLangue = {
            ...newLangue,
            id: Number(newLangue.id),
            user_id: Number(newLangue.user_id),
        };

        res.status(201).json({ message: 'Langue created successfully', langue: serializedLangue });
    } catch (error) {
        res.status(500).json({ error: error.message });
        throw Error(error);
    }
});

router.delete('/:userid/:langueId', async (req, res) => {
    const { userid, langueId } = req.params;

    try {
        userCheck(req, userid);

        await prisma.qrf_langues_carte.delete({
            where: {
                id: Number(langueId)
            },
        });

        res.status(200).json({ message: 'Langue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
    }
});

router.put('/:userid', async (req, res) => {
    const { userid } = req.params;
    const langueItems = req.body;

    try {
        userCheck(req, userid);

        for (const item of langueItems) {
            try {
                await prisma.qrf_langues_carte.update({
                    where: {
                        id: Number(item.id),
                        user_id: Number(userid)
                    },
                    data: {
                        code: item.code,
                        langue: item.langue,
                        number: Number(item.number),
                    },
                });
            } catch (error) {
                throw new Error(`Failed to update langue item (${item.id}, ${item.code}, ${item.langue}, ${item.number}): ${error.message}`);
            }
        }

        res.status(200).json({ message: 'Langues updated successfully' });
    } catch (error) {
        console.error('Error updating menus:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:userid/:langueId', async (req, res) => {
    const { userid, langueId } = req.params;
    const { code, langue } = req.body;

    try {
        userCheck(req, userid);

        await prisma.qrf_langues_carte.update({
            where: {
                id: Number(langueId),
                user_id: Number(userid)
            },
            data: {
                code: code,
                langue: langue
            },
        });

        res.status(200).json({ message: `Langue updated successfully` });
    } catch (error) {
        console.error('Error updating langue field:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;