"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.addFav = addFav;
exports.updateFav = updateFav;
exports.deleteFav = deleteFav;
exports.getAll = getAll;
const DB_1 = __importDefault(require("../lib/DB"));
const validate_1 = require("./validate");
const bcrypt_1 = __importDefault(require("bcrypt"));
const JwtToken_1 = require("./JwtToken");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function register(req, res) {
    console.log("BODY:", req.body);
    let msg = await (0, validate_1.validateReg)(req);
    if (msg) {
        return res.status(400).json({ message: msg });
    }
    else {
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt_1.default.hash(password, 10);
        let token = await (0, validate_1.getToken)();
        let save = await DB_1.default.userCred.create({
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
async function login(req, res) {
    console.log("BODY:", req.body);
    const { email, password, rememberMe } = req.body || {};
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required." });
    }
    const user = await DB_1.default.userCred.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(400).json({ message: "User not found." });
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(400).json({ message: "Invalid credentials." });
    }
    return res.status(200).json({
        message: "Login successful.",
        accessToken: await (0, JwtToken_1.generateToken)(user.token, user.id, rememberMe),
    });
}
async function addFav(req, res) {
    console.log("BODY:", req.body);
    const msg = await (0, validate_1.validateFav)(req);
    const image = req.file;
    if (msg) {
        if (image)
            await promises_1.default.unlink(image.path);
        return res.status(400).json({ message: msg });
    }
    let fav;
    if (image) {
        const { title, type, director, budget, location, duration, time } = req.body || {};
        const userCred = req.user;
        fav = await DB_1.default.userFav.create({
            data: {
                userId: userCred.id,
                title,
                type,
                director,
                budget,
                location,
                duration,
                time,
                image: path_1.default.basename(image.path)
            }
        });
    }
    return res.status(200).json({ data: fav });
}
async function updateFav(req, res) {
    console.log("BODY:", req.body);
    const msg = await (0, validate_1.validateFavUpdate)(req);
    const image = req.file;
    if (msg) {
        if (image)
            await promises_1.default.unlink(image.path);
        return res.status(400).json({ message: msg });
    }
    let fav;
    // if (image) {
    const { id, title, type, director, budget, location, duration, time, action } = req.body || {};
    const userCred = req.user;
    const updateData = {};
    if (title !== undefined)
        updateData.title = title;
    if (type !== undefined)
        updateData.type = type;
    if (director !== undefined)
        updateData.director = director;
    if (budget !== undefined)
        updateData.budget = budget;
    if (location !== undefined)
        updateData.location = location;
    if (duration !== undefined)
        updateData.duration = duration;
    if (time !== undefined)
        updateData.time = time;
    if (action !== undefined)
        updateData.action = action;
    if (req.file)
        updateData.image = req.file.filename;
    fav = await DB_1.default.userFav.update({
        where: {
            id: parseInt(id),
            userId: userCred.id
        },
        data: updateData
    });
    // }
    return res.status(200).json({ data: fav });
}
async function deleteFav(req, res) {
    const { id } = req.body || {};
    console.log(req.body);
    const userCred = req.user;
    let msg;
    if (!id || !userCred) {
        msg = "fav movie/show not found";
    }
    const exist = await DB_1.default.userFav.findFirst({
        where: { id: parseInt(id), userId: userCred.id, active: true }
    });
    if (!exist) {
        msg = "fav movie/show not found";
    }
    let fav;
    if (!msg) {
        fav = await DB_1.default.userFav.update({
            where: {
                id: parseInt(id),
                userId: userCred.id
            },
            data: { active: false }
        });
        return res.status(200).json({ message: "success" });
    }
    return res.status(400).json({ message: msg });
}
async function getAll(req, res) {
    const userCred = req.user;
    if (!userCred) {
        return res.status(401).json({ messgae: "unauthorize" });
    }
    const data = await DB_1.default.userFav.findMany({
        where: { userId: userCred.id, active: true }
    });
    return res.status(200).json({ data: data });
}
