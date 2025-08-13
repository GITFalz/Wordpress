import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

router.put('/:userid', async (req, res) => {
    const { userid } = req.params;
    const categorieItems = req.body;

    try {
        userCheck(req, userid);

        for (const item of categorieItems.updated) {
            try {
                await prisma.qrf_categories.update({
                    where: { 
                        id: Number(item.id),
                        user_id: Number(userid)
                    },
                    data: {
                        name: item.name,
                        description: item.description,
                        icon: item.icon,
                        traduisible: item.traduisible??false,
                        number: Number(item.number),
                    },
                });
            } catch (error) {
                throw new Error(`Failed to update categorie item (${item.id}, ${item.name}, ${item.number}): ${error.message}`);
            }
        }
        let addedCategorieItems = [];
        for (const item of categorieItems.added) {
            try {
                let menu = await prisma.qrf_categories.create({
                    data: {
                        user_id: Number(userid),
                        name: item.name,
                        description: item.description,
                        icon: item.icon,
                        traduisible: item.traduisible??false,
                        number: Number(item.number),
                    },
                });
                addedCategorieItems.push({ oldId: item.id, newId: Number(menu.id) });
            } catch (error) {
                throw new Error(`Failed to create categorie item (${item.name}): ${error.message}`);
            }
        }
        for (const item of categorieItems.deleted) {
            try {
                await prisma.qrf_categories.delete({
                    where: {
                        id: Number(item.id),
                        user_id: Number(userid)
                    },
                });
            } catch (error) {
                throw new Error(`Failed to delete categorie item (${item.id}): ${error.message}`);
            }
        }
        res.status(200).json({ message: 'Categories updated successfully', added: addedCategorieItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;  