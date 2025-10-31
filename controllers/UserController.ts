import prismaDb from "../lib/DB";
import type { Request, Response } from "express";
import { getToken, upload, validateFav, validateFavUpdate, validateReg } from "./validate";
import type { Register } from "./interface";
import bcrypt from "bcrypt";
import { generateToken } from "./JwtToken";
import fs from "fs/promises";
import path from "path";

export async function register(req: Request, res: Response) {
  console.log("BODY:", req.body);
  let msg = await validateReg(req);
  if (msg) {
    return res.status(400).json({ message: msg });
  } else {
    const { name, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    let token = await getToken();
    let save = await prismaDb.userCred.create({
      data: {
        name,
        email,
        password: hashPassword,
        token,
      },
    });
    if (save) {
      return res.status(200).json({ message: "success" });
    }
  }
}

export async function login(req: Request, res: Response) {
  console.log("BODY:", req.body);
  const { email, password, rememberMe } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  const user = await prismaDb.userCred.findUnique({
    where: { email },
  });
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid credentials." });
  }
  return res.status(200).json({
    message: "Login successful.",
    accessToken: await generateToken(user.token, user.id, rememberMe),
  });
}

export async function addFav(req: Request, res: Response) {
  console.log("BODY:", req.body);
  const msg = await validateFav(req);
  const image = req.file;
  if (msg) {
    if (image) await fs.unlink(image.path);
    return res.status(400).json({ message: msg });
  }
  let fav;
  if (image) {
    const { title, type, director, budget, location, duration, time } = req.body || {};
    const userCred = req.user;
    fav = await prismaDb.userFav.create({
      data: {
        userId: userCred.id,
        title,
        type,
        director,
        budget,
        location,
        duration,
        time,
        image: path.basename(image.path)
      }
    })
  }
  return res.status(200).json({ data: fav })
}

export async function updateFav(req: Request, res: Response) {
  console.log("BODY:", req.body);
  const msg = await validateFavUpdate(req);
  const image = req.file;
  if (msg) {
    if (image) await fs.unlink(image.path);
    return res.status(400).json({ message: msg });
  }
  let fav;
  // if (image) {
  const { id, title, type, director, budget, location, duration, time, action } = req.body || {};
  const userCred = req.user;
  const updateData: any = {};

  if (title !== undefined) updateData.title = title;
  if (type !== undefined) updateData.type = type;
  if (director !== undefined) updateData.director = director;
  if (budget !== undefined) updateData.budget = budget;
  if (location !== undefined) updateData.location = location;
  if (duration !== undefined) updateData.duration = duration;
  if (time !== undefined) updateData.time = time;
  if (action !== undefined) updateData.action = action;
  if (req.file) updateData.image = req.file.filename;

  fav = await prismaDb.userFav.update({
    where: {
      id: parseInt(id),
      userId: userCred.id
    },
    data: updateData
  });

  // }
  return res.status(200).json({ data: fav })
}

export async function deleteFav(req: Request, res: Response) {
  const { id } = req.body || {}
  console.log(req.body)
  const userCred = req.user
  let msg;
  if (!id || !userCred) {
    msg = "fav movie/show not found";
  }
  const exist = await prismaDb.userFav.findFirst({
    where: { id: parseInt(id), userId: userCred.id, active: true }
  })
  if (!exist) {
    msg = "fav movie/show not found";
  }
  let fav;
  if (!msg) {
    fav = await prismaDb.userFav.update({
      where: {
        id: parseInt(id),
        userId: userCred.id
      },
      data: { active: false }
    });
    return res.status(200).json({ message: "success" })
  }
  return res.status(400).json({ message: msg })
}

export async function getAll(req: Request, res: Response) {
  const userCred = req.user
  if (!userCred) {
    return res.status(401).json({ messgae: "unauthorize" })
  }
  const data = await prismaDb.userFav.findMany({
    where: { userId: userCred.id, active: true }
  })
  return res.status(200).json({ data: data })
}