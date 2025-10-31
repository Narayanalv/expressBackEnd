import pkg, { type JwtPayload, type Secret } from "jsonwebtoken";
const { sign, verify, decode } = pkg;
import { v4 as uuidv4 } from "uuid";
import prismaDb from "../lib/DB";

export async function generateToken(
  userToken: string,
  userId: number,
  rememberMe: boolean
) {
  const key1: string = uuidv4();
  const key2: string = uuidv4();
  const token: string = `${key1}.${userToken}.${key2}`;
  await prismaDb.userSession.updateMany({
    where: { userId: userId },
    data: { active: false },
  })
  await prismaDb.userSession.create({
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

export async function verifyToken(token: string) {
  const secretKey = process.env.JWT_SECRET || "123456789";
  try {
    const decoded = verify(token, secretKey) as JwtPayload;
    return await prismaDb.userSession.findFirst({ where: { token: decoded.token, active: true } });
  } catch (error) {
    return null;
  }
}
