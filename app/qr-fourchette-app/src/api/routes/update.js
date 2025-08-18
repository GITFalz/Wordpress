import getFontList from "../../scripts/font-manager.js";
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userCheck } from '../../middlewares/userCheck.js';

const router = express.Router();
const prisma = new PrismaClient();

const ADMIN_KEY = process.env.FONTS_ADMIN_KEY;

router.post("/fonts/:key", async (req, res) => {
    const { key } = req.params;
    if (key !== ADMIN_KEY) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const fonts = await getFontList(process.env.PUBLIC_GOOGLE_FONTS_API_KEY);
        console.log("API key: ", process.env.PUBLIC_GOOGLE_FONTS_API_KEY);

        for (const font of fonts) {
            // generate the Google Fonts CSS URL for default variant
           

            await prisma.qrf_fonts.upsert({
                where: { name: font.family }, // use name as unique identifier
                update: {
                    category: font.category,
                    url: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}&display=swap`
                },
                create: {
                    name: font.family,
                    category: font.category,
                    url: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}&display=swap`
                }
            });
        }

        res.json({ message: "Fonts updated successfully", count: fonts.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update fonts with api key: " + process.env.PUBLIC_GOOGLE_FONTS_API_KEY });
        throw Error(error);
    }
});

export default router;