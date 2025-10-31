import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./JwtToken";
import prisma from "../lib/DB";
import { userInfo } from "node:os";

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = await verifyToken(token);
        if (user?.userId) {
            const UserCredInfo = await prisma.userCred.findFirst({ where: { id: user.userId } });
            if (UserCredInfo) {
                req.user = UserCredInfo
                return next();
            }
        }
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(401).json({ message: "Unauthorized" });
}
