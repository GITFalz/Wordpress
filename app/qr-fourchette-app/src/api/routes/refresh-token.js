import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.qrf_users.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        const newToken = jwt.sign({ userId: user.id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Token refreshed successfully',
            token: newToken,
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;