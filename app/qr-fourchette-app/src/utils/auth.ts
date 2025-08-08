import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

type Payload = {
    sub?: string;
    userId?: string;
    username: string;
    email: string;
    iat: number;
    exp: number;
};

export function verifyJWT(token: string): Promise<Payload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err || !decoded) {
                // Enhanced error detail
                const errorMessage = (() => {
                    if (!err) return 'Token verification failed with unknown error';
                    switch (err.name) {
                        case 'TokenExpiredError':
                            // 'expiredAt' is specific to TokenExpiredError
                            return `Token expired at ${(err as jwt.TokenExpiredError).expiredAt}`;
                        case 'JsonWebTokenError':
                            return `JWT Error: ${err.message}`;
                        case 'NotBeforeError':
                            return `Token not active until ${(err as jwt.NotBeforeError).date}`;
                        default:
                            return `Unknown JWT error: ${err.message}`;
                    }
                })();
                return reject(new Error(errorMessage));
            }

            resolve(decoded as Payload);
        });
    });
}
