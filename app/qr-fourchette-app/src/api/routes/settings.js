import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

async function newSettings(key, categorie, value, userId) {
    return await prisma.qrf_settings.create({
        data: {
            settings_key: key,
            category: categorie,
            value: value,
            user_id: userId
        }
    });
}

async function getFromKey(key, categorie, userId) {
    return await prisma.qrf_settings.findUnique({
        where: {
            user_id: userId,
            category: categorie,
            settings_key: key
        }
    });
}

async function getOrCreate(key, categorie, userId, value = '') {
    const settings = await getFromKey(key, categorie, userId);
    if (!settings) {
        return await newSettings(key, categorie, value, userId);
    }
    return settings;
}

async function getFromCategorie(categorie, userId) {
       return await prisma.qrf_settings.findMany({
        where: {
            user_id: userId,
            category: categorie
        }
    });
}

async function updateSettings(settingsId, value) {
    return await prisma.qrf_settings.update({
        where: {
            id: settingsId
        },
        data: {
            value: value
        }
    });
}

async function deleteSettings(settingsId) {
    return await prisma.qrf_settings.delete({
        where: {
            id: settingsId
        }
    });
}

function serializeSettings(settings) {
    return settings.map(setting => ({
        id: Number(setting.id),
        key: setting.settings_key,
        category: setting.category,
        value: setting.value
    }));
}

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

router.get('/:userid/:categorie', async (req, res) => {
    const { userid, categorie } = req.params;
    try {
        const settings = await getFromCategorie(categorie, Number(userid));
        return res.json(serializeSettings(settings));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/:userid/:categorie/:key', async (req, res) => {
    const { userid, categorie, key } = req.params;
    try {
        const settings = await getFromKey(key, categorie, Number(userid));
        return res.json(serializeSettings([settings]));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/:userid/:categorie', async (req, res) => {
    const { userid, categorie } = req.params;
    const { keys } = req.body;

    try {
        const settingsArray = await Promise.all(
            keys.map(async key => {
                if (typeof key === 'object' && key !== null && 'key' in key && 'value' in key) {
                    return await getOrCreate(key.key, categorie, Number(userid), key.value);
                } else {
                    return await getOrCreate(key, categorie, Number(userid));
                }
            })
        );

        const settings = settingsArray.reduce((acc, s) => {
            acc[s.settings_key] = { id: Number(s.id), value: s.value };
            return acc;
        }, {});

        return res.json(settings);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put('/:userid/:id', async (req, res) => {
    const { userid, id } = req.params;
    const { value } = req.body;
    try {
        const settings = await updateSettings(Number(id), value);
        return res.json(serializeSettings([settings]));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/:userid/:id', async (req, res) => {
    const { userid, id } = req.params;
    try {
        const settings = await deleteSettings(Number(id));
        return res.json(serializeSettings([settings]));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;