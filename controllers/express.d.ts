import { UserSession } from "@prisma/client";
declare global {
    namespace Express {
        interface Request {
            user?: UserSession;
        }
    }
}