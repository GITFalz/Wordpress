import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        userCheck(req, userid); // may throw

        const menus = await prisma.qrf_menus.findMany({
            where: { user_id: userid },
            orderBy: { number: 'asc' },
        });

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

router.post('/:userid', async (req, res) => {
    const { userid } = req.params;
    const { menuData } = req.body;

    try {
        userCheck(req, userid);

        const newMenu = await prisma.qrf_menus.create({
            data: {
                user_id: Number(userid),
                ...menuData
            },
        });

        const serializedMenu = {
            ...newMenu,
            id: Number(newMenu.id),
            user_id: Number(newMenu.user_id),
        };

        res.status(201).json({ message: 'Menu created successfully', menu: serializedMenu });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:userid/:menuId', async (req, res) => {
    const { userid, menuId } = req.params;

    try {
        userCheck(req, userid);

        await prisma.qrf_menus.delete({
            where: {
                id: Number(menuId)
            },
        });

        res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
    }
});

router.put('/:userid', async (req, res) => {
    const { userid } = req.params;
    const menuItems = req.body;

    try {
        userCheck(req, userid);
        
        for (const item of menuItems) {
            try {
                await prisma.qrf_menus.update({
                    where: {
                        id: Number(item.id),
                        user_id: Number(userid)
                    },
                    data: {
                        name: item.name,
                        description: item.description,
                        entrees: item.entrees,
                        plats: item.plats,
                        desserts: item.desserts,
                        number: Number(item.number),
                    },
                });
            } catch (error) {
                throw new Error(`Failed to update menu item (${item.id}, ${item.name}, ${item.number}): ${error.message}`);
            }
        }

        res.status(200).json({ message: 'Menus updated successfully' });
    } catch (error) {
        console.error('Error updating menus:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:userid/:menuId/:field', async (req, res) => {
    const { userid, menuId, field } = req.params;
    const { value } = req.body;

    try {
        userCheck(req, userid);

        await prisma.qrf_menus.update({
            where: {
                id: Number(menuId),
                user_id: Number(userid)
            },
            data: {
                [field]: value
            },
        });

        res.status(200).json({ message: `${field} updated successfully` });
    } catch (error) {
        console.error('Error updating menu field:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;