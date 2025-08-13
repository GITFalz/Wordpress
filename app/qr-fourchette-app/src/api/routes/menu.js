import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.put('/:userid', async (req, res) => {
    const { userid } = req.params;
    const menuItems = req.body;

    try {
        userCheck(req, userid);

        for (const item of menuItems.updated) {
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
        let addedMenuItems = [];
        for (const item of menuItems.added) {
            try {
                let menu = await prisma.qrf_menus.create({
                    data: {
                        user_id: Number(userid),
                        name: item.name,
                        description: item.description,
                        entrees: item.entrees,
                        plats: item.plats,
                        desserts: item.desserts,
                        number: Number(item.number),
                    },
                });
                addedMenuItems.push({ oldId: item.id, newId: Number(menu.id) });
            } catch (error) {
                throw new Error(`Failed to create menu item (${item.name}): ${error.message}`);
            }
        }
        for (const item of menuItems.deleted) {
            try {
                await prisma.qrf_menus.delete({
                    where: {
                        id: Number(item.id),
                        user_id: Number(userid)
                    },
                });
            } catch (error) {
                throw new Error(`Failed to delete menu item (${item.id}): ${error.message}`);
            }
        }
        res.status(200).json({ message: 'Menus updated successfully', added: addedMenuItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;  