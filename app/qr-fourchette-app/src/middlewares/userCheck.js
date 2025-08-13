import jwt from 'jsonwebtoken';
export function userCheck(req, userId) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new Error('Authorization error');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.userId !== userId) {
            throw new Error('Forbidden');
        }
    } catch {
        throw new Error('Unauthorized');
    }
}