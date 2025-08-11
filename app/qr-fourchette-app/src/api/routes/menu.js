import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.put('/name/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        await prisma.qrf_menus.update({
            where: { id: Number(id) },
            data: { name: name },
        });
        res.send('');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update menu name' });
    }
});

router.put('/description/:id', async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    try {
        await prisma.qrf_menus.update({
            where: { id: Number(id) },
            data: { description: description },
        });
        res.send('');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update menu description' });
    }
});

router.put('/entrees/:id', async (req, res) => {
    const { id } = req.params;
    const { entrees } = req.body;

    try {
        await prisma.qrf_menus.update({
            where: { id: Number(id) },
            data: { entrees: entrees },
        });
        res.send('');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update menu entrees' });
    }
});

router.put('/plats/:id', async (req, res) => {
    const { id } = req.params;
    const { plats } = req.body;

    try {
        await prisma.qrf_menus.update({
            where: { id: Number(id) },
            data: { plats: plats },
        });
        res.send('');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update menu plats' });
    }
});

router.put('/desserts/:id', async (req, res) => {
    const { id } = req.params;
    const { desserts } = req.body;

    try {
        await prisma.qrf_menus.update({
            where: { id: Number(id) },
            data: { desserts: desserts },
        });
        res.send('');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update menu desserts' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // get the menu item before it is deleted
        const menu = await prisma.qrf_menus.findUnique({
            where: { id: Number(id) },
        });
        const number = menu.number;
        
        // update all the menu items that follow to have the correct index
        await prisma.qrf_menus.updateMany({
            where: { number: { gte: number }, id: { not: menu.id } },
            data: { number: { decrement: 1 } },
        });

        // delete the menu
        await prisma.qrf_menus.delete({
            where: { id: Number(id) },
        });
        res.send('');
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete menu' });
    }
});

export default router;  