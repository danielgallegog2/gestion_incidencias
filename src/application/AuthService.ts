import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET|| "asdwqjndqoijdqkndkjsnakjndkajnd";
export class AuthService{
    static generateToken(payload: object):string{
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    }
    static verifyToken(token: string): any{
        return jwt.verify(token, JWT_SECRET);
    }
}