import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

// === GET CATEGORIES ===
router.get('/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        userCheck(req, userid); // may throw

        const categories = await prisma.qrf_categories.findMany({
            where: { user_id: userid },
            orderBy: { number: 'asc' },
        });

        const serializedCategories = categories.map(category => ({
            ...category,
            id: Number(category.id),
            user_id: Number(category.user_id),
        }));

        res.status(200).json({ message: "success!", categories: serializedCategories });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

// === GET PLATS ===
router.get('/plat/:userid/:categoryId', async (req, res) => {
    const { userid, categoryId } = req.params;
    try {
        userCheck(req, userid);

        const plats = await prisma.qrf_plats.findMany({
            where: { categorie_id: Number(categoryId) },
            orderBy: { number: 'asc' },
        });

        const serializedPlats = plats.map(plat => ({
            ...plat,
            id: Number(plat.id),
            categorie_id: Number(plat.categorie_id),
        }));

        res.status(200).json({ message: "success!", plats: serializedPlats });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get('/plat/labels/:userid/:platid', async (req, res) => {
    const { userid, platid } = req.params;
    try {
        userCheck(req, userid);

        const labels = await prisma.qrf_plat_labels.findMany({
            where: { plat_id: Number(platid) },
            include: { qrf_labels: true },
        });

        const serializedLabels = labels.map(label => ({
            ...label,
            id: Number(label.id),
            plat_id: Number(label.plat_id),
            qrf_labels: {
                ...label.qrf_labels,
                id: Number(label.qrf_labels.id)
            }
        }));

        res.status(200).json({ message: "success!", labels: serializedLabels });
    } catch (error) {
        const statusCode = error.message === 'Authorization error' || error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

// === POST CATEGORIES ===
router.post('/:userid', async (req, res) => {
    const { userid } = req.params;
    const { categorieData } = req.body;

    try {
        userCheck(req, userid);

        const newCategory = await prisma.qrf_categories.create({
            data: {
                user_id: Number(userid),
                ...categorieData
            },
        });

        const serializedCategory = {
            ...newCategory,
            id: Number(newCategory.id),
            user_id: Number(newCategory.user_id),
        };

        res.status(201).json({ message: 'Category created successfully', categorie: serializedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === POST PLATS ===
router.post('/plat/:userid/:categoryId', async (req, res) => {
    const { userid, categoryId } = req.params;
    const { platData } = req.body;

    try {
        userCheck(req, userid);

        const newPlat = await prisma.qrf_plats.create({
            data: {
                categorie_id: Number(categoryId),
                ...platData
            },
        });

        const serializedPlat = {
            ...newPlat,
            id: Number(newPlat.id),
            categorie_id: Number(newPlat.categorie_id),
        };

        res.status(201).json({ message: 'Plat created successfully', plat: serializedPlat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/plat/label/:userid/:platid', async (req, res) => {
    const { userid, platid } = req.params;
    const { labelId } = req.body;

    try {
        userCheck(req, userid);

        await prisma.qrf_plat_labels.create({
            data: {
                plat_id: Number(platid),
                label_id: Number(labelId)
            }
        });

        res.status(201).json({ message: 'Label added to plat successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === DELETE CATEGORIES ===
router.delete('/:userid/:categoryId', async (req, res) => {
    const { userid, categoryId } = req.params;

    try {
        userCheck(req, userid);

        await prisma.qrf_categories.delete({
            where: {
                id: Number(categoryId)
            },
        });

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
    }
});

// === DELETE PLATS
router.delete('/plat/:userid/:platId', async (req, res) => {
    const { userid, platId } = req.params;

    try {
        userCheck(req, userid);

        await prisma.qrf_plats.delete({
            where: {
                id: Number(platId)
            },
        });

        res.status(200).json({ message: 'Plat deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
    }
});

// === UPDATE CATEGORIES ===
router.put('/:userid', async (req, res) => {
    const { userid } = req.params;
    const categorieItems = req.body;

    try {
        userCheck(req, userid);

        for (const item of categorieItems) {
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
                        traduisible: item.traduisible,
                        number: Number(item.number),
                    },
                });
            } catch (error) {
                throw new Error(`Failed to update categorie item (${item.id}, ${item.name}, ${item.number}): ${error.message}`);
            }
        }

        res.status(200).json({ message: 'Categories updated successfully' });
    } catch (error) {
        console.error('Error updating categories:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/plat/label/:userid/:platid/:labelid', async (req, res) => {
    const { userid, platid, labelid } = req.params;

    try {
        userCheck(req, userid);

        await prisma.qrf_plat_labels.delete({
            where: {
                plat_id_label_id: {
                    plat_id: Number(platid),
                    label_id: Number(labelid)
                }
            }
        });

        res.status(200).json({ message: 'Label removed from plat successfully' });
    } catch (error) {
        throw new Error(error);
        res.status(500).json({ error: error.message });
    }
});

// === UPDATE PLATS ===
router.put('/plat/:userid/:categoryId', async (req, res) => {
    const { userid, categoryId } = req.params;
    const platItems = req.body;

    try {
        userCheck(req, userid);

        for (const platData of platItems) {
            try {
                await prisma.qrf_plats.update({
                    where: {
                        id: Number(platData.id),
                        categorie_id: Number(categoryId)
                    },
                    data: {
                        name: platData.name,
                        description: platData.description,
                        prix: Number(platData.prix),
                        image: platData.image,
                        traduisible: platData.traduisible,
                        number: Number(platData.number)
                    },
                });
            } catch (error) {
                throw new Error(`Failed to update plat item (${platData.id}, ${platData.name}): ${error.message}`);
            }
        }

        res.status(200).json({ message: 'Plats updated successfully' });
    } catch (error) {
        console.error('Error updating plats:', error);
        res.status(500).json({ error: error.message });
    }
});

// === UPDATE CATEGORIES FIELDS
router.put('/:userid/:categoryId/:field', async (req, res) => {
    const { userid, categoryId, field } = req.params;
    const { value } = req.body;

    try {
        userCheck(req, userid);

        await prisma.qrf_categories.update({
            where: {
                id: Number(categoryId)
            },
            data: {
                [field]: value
            },
        });

        res.status(200).json({ message: `${field} updated successfully` });
    } catch (error) {
        console.error('Error updating categorie field:', error);
        res.status(500).json({ error: error.message });
    }
});

// === UPDATE PLATS FIELDS
router.put('/plat/:userid/:platId/:field', async (req, res) => {
    const { userid, platId, field } = req.params;
    const { value } = req.body;

    try {
        userCheck(req, userid);

        await prisma.qrf_plats.update({
            where: {
                id: Number(platId)
            },
            data: {
                [field]: value
            },
        });

        res.status(200).json({ message: `${field} updated successfully` });
    } catch (error) {
        console.error('Error updating plat field:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;  