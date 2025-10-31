import dotenv from 'dotenv';
dotenv.config();
import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/DB";
import type { Register } from "./interface";
import multer from "multer"
import path from "path";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


const validateRegInput = (req: Request) => {
  let msg = null;
  const { name, email, password, confirmPassword } = req.body || {};
  if (!name) {
    msg = "Name is required.";
  } else if (!email) {
    msg = "Email is required.";
  } else if (!password || !confirmPassword) {
    msg = "Password is required.";
  } else if (password !== confirmPassword) {
    msg = "Passwords do not match.";
  }
  return msg;
};

export const validateReg = async (req: Request) => {
  let msg = validateRegInput(req);
  if (!msg) {
    const { email } = req.body;
    const existEmail = await prisma.userCred.findFirst({
      where: { email },
    });
    if (existEmail) {
      msg = "You have already registered";
    }
  }
  return msg;
};
function generateRandomString(
  length: number,
  characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const getToken = async () => {
  let exist = true;
  let token = "";
  while (exist) {
    token = generateRandomString(10);
    let existToken = await prisma.userCred.findUnique({
      where: { token },
    });
    if (!existToken) {
      exist = false;
    }
  }
  return token;
};

const typeAr = ["Movie", "TV Show"]
export const validateFav = async (req: Request) => {
  const { title, type, director, budget, location, duration, time } = req.body || {};
  const image = req.file;
  let msg = null;
  if (!title) {
    msg = "title is mandatory";
  } else if (!type || !typeAr.includes(type)) {
    msg = !type ? "type is mandatory" : "select the type in dorpdown";
  } else if (!director) {
    msg = "director is mandatory";
  } else if (!budget) {
    msg = "budget is mandatory";
  } else if (!location) {
    msg = "location is mandatory";
  } else if (!duration) {
    msg = "duration is mandatory";
  } else if (!time) {
    msg = "time is mandatory";
  } else if (!image) {
    msg = "movie poster is required";
  } else {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(image.originalname).toLowerCase());
    if (!extname) {
      msg = "only jpeg, jpg, png, webp images are allowed";
    } else if (parseInt((image.size / (1024 * 1024)).toFixed(2)) > 5) {
      msg = "image size should be lesser than 5 mb";
    }
  }
  return msg;
};

export const validateFavUpdate = async (req: Request) => {
  const { id, title, type, director, budget, location, duration, time } = req.body || {};
  const image = req.file;
  const userCred = req.user;
  let msg = null;
  if (!id) {
    msg = "fav movie/show not found"
  }
  else if (type !== undefined && (!type || !typeAr.includes(type))) {
    msg = !type ? "type cannot be empty if provided" : "select the type in dropdown";
  }
  else if (title !== undefined && !title.trim()) {
    msg = "title cannot be empty if provided";
  }
  else if (director !== undefined && !director.trim()) {
    msg = "director cannot be empty if provided";
  }
  else if (budget !== undefined && !budget) {
    msg = "budget cannot be empty if provided";
  }
  else if (location !== undefined && !location.trim()) {
    msg = "location cannot be empty if provided";
  }
  else if (duration !== undefined && !duration) {
    msg = "duration cannot be empty if provided";
  }
  else if (time !== undefined && !time) {
    msg = "time cannot be empty if provided";
  }
  else if (image) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(image.originalname).toLowerCase());
    if (!extname) {
      msg = "only jpeg, jpg, png, webp images are allowed";
    } else if (parseInt((image.size / (1024 * 1024)).toFixed(2)) > 5) {
      msg = "image size should be lesser than 5 mb";
    }
  } else {
    const exist = await prisma.userFav.findFirst({
      where: { id: parseInt(id), userId: userCred.id }
    })
    if (!exist) {
      msg = "fav movie/show not found"
    }
  }

  return msg;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    return {
      folder: 'movies',
      public_id: "movie-" + uniqueSuffix,
      resource_type: 'image',
    };
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.originalname) {
    return cb(null, false);
  }
  
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    return cb(new Error("Only jpeg, jpg, png, webp images are allowed"));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

export function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image size should be lesser than 5 mb" });
    }
    return res.status(400).json({ message: err.message || "Multer error occurred" });
  } else if (err) {
    console.log(err)
    return res.status(400).json({ message: err.message || "File upload error occurred" });
  }
  next();
}
