import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        userCheck(req, userid);

        const menus = await prisma.qrf_settings

        const serializedMenus = menus.map(menu => ({
            ...menu,
            id: Number(menu.id),
            user_id: Number(menu.user_id),
        }));

        res.status(200).json({ message: "success!", menus: serializedMenus });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});