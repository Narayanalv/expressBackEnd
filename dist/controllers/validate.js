"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.validateFavUpdate = exports.validateFav = exports.getToken = exports.validateReg = void 0;
exports.handleMulterError = handleMulterError;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_1 = __importDefault(require("../lib/DB"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const validateRegInput = (req) => {
    let msg = null;
    const { name, email, password, confirmPassword } = req.body || {};
    if (!name) {
        msg = "Name is required.";
    }
    else if (!email) {
        msg = "Email is required.";
    }
    else if (!password || !confirmPassword) {
        msg = "Password is required.";
    }
    else if (password !== confirmPassword) {
        msg = "Passwords do not match.";
    }
    return msg;
};
const validateReg = async (req) => {
    let msg = validateRegInput(req);
    if (!msg) {
        const { email } = req.body;
        const existEmail = await DB_1.default.userCred.findFirst({
            where: { email },
        });
        if (existEmail) {
            msg = "You have already registered";
        }
    }
    return msg;
};
exports.validateReg = validateReg;
function generateRandomString(length, characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const getToken = async () => {
    let exist = true;
    let token = "";
    while (exist) {
        token = generateRandomString(10);
        let existToken = await DB_1.default.userCred.findUnique({
            where: { token },
        });
        if (!existToken) {
            exist = false;
        }
    }
    return token;
};
exports.getToken = getToken;
const typeAr = ["Movie", "TV Show"];
const validateFav = async (req) => {
    const { title, type, director, budget, location, duration, time } = req.body || {};
    const image = req.file;
    let msg = null;
    if (!title) {
        msg = "title is mandatory";
    }
    else if (!type || !typeAr.includes(type)) {
        msg = !type ? "type is mandatory" : "select the type in dorpdown";
    }
    else if (!director) {
        msg = "director is mandatory";
    }
    else if (!budget) {
        msg = "budget is mandatory";
    }
    else if (!location) {
        msg = "location is mandatory";
    }
    else if (!duration) {
        msg = "duration is mandatory";
    }
    else if (!time) {
        msg = "time is mandatory";
    }
    else if (!image) {
        msg = "movie poster is required";
    }
    else {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path_1.default.extname(image.originalname).toLowerCase());
        if (!extname) {
            msg = "only jpeg, jpg, png, webp images are allowed";
        }
        else if (parseInt((image.size / (1024 * 1024)).toFixed(2)) > 5) {
            msg = "image size should be lesser than 5 mb";
        }
    }
    return msg;
};
exports.validateFav = validateFav;
const validateFavUpdate = async (req) => {
    const { id, title, type, director, budget, location, duration, time } = req.body || {};
    const image = req.file;
    const userCred = req.user;
    let msg = null;
    if (!id) {
        msg = "fav movie/show not found";
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
        const extname = allowedTypes.test(path_1.default.extname(image.originalname).toLowerCase());
        if (!extname) {
            msg = "only jpeg, jpg, png, webp images are allowed";
        }
        else if (parseInt((image.size / (1024 * 1024)).toFixed(2)) > 5) {
            msg = "image size should be lesser than 5 mb";
        }
    }
    else {
        const exist = await DB_1.default.userFav.findFirst({
            where: { id: parseInt(id), userId: userCred.id }
        });
        if (!exist) {
            msg = "fav movie/show not found";
        }
    }
    return msg;
};
exports.validateFavUpdate = validateFavUpdate;
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return {
            folder: 'movies',
            public_id: "movie-" + uniqueSuffix,
            resource_type: 'image',
        };
    }
});
const fileFilter = (req, file, cb) => {
    if (!file.originalname) {
        return cb(null, false);
    }
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        return cb(new Error("Only jpeg, jpg, png, webp images are allowed"));
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});
function handleMulterError(err, req, res, next) {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Image size should be lesser than 5 mb" });
        }
        return res.status(400).json({ message: err.message || "Multer error occurred" });
    }
    else if (err) {
        console.log(err);
        return res.status(400).json({ message: err.message || "File upload error occurred" });
    }
    next();
}
