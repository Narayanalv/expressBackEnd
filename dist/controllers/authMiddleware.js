"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = verifyUser;
const JwtToken_1 = require("./JwtToken");
const DB_1 = __importDefault(require("../lib/DB"));
async function verifyUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = await (0, JwtToken_1.verifyToken)(token);
        if (user?.userId) {
            const UserCredInfo = await DB_1.default.userCred.findFirst({ where: { id: user.userId } });
            if (UserCredInfo) {
                req.user = UserCredInfo;
                return next();
            }
        }
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(401).json({ message: "Unauthorized" });
}
