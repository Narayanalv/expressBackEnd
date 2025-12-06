"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { sign, verify, decode } = jsonwebtoken_1.default;
const uuid_1 = require("uuid");
const DB_1 = __importDefault(require("../lib/DB"));
async function generateToken(userToken, userId, rememberMe) {
    const key1 = (0, uuid_1.v4)();
    const key2 = (0, uuid_1.v4)();
    const token = `${key1}.${userToken}.${key2}`;
    await DB_1.default.userSession.updateMany({
        where: { userId: userId },
        data: { active: false },
    });
    await DB_1.default.userSession.create({
        data: {
            userId,
            token,
        },
    });
    const secretKey = process.env.JWT_SECRET || "123456789";
    const jwtToken = rememberMe
        ? sign({ token }, secretKey)
        : sign({ token }, secretKey, { expiresIn: "1h" });
    return jwtToken;
}
async function verifyToken(token) {
    const secretKey = process.env.JWT_SECRET || "123456789";
    try {
        const decoded = verify(token, secretKey);
        return await DB_1.default.userSession.findFirst({ where: { token: decoded.token, active: true } });
    }
    catch (error) {
        return null;
    }
}
