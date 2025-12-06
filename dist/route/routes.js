"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const validate_1 = require("../controllers/validate");
const multer_1 = __importDefault(require("multer"));
const uploadTest = (0, multer_1.default)();
const router = express_1.default.Router();
router.post("/register", uploadTest.none(), UserController_1.register);
router.post("/login", uploadTest.none(), UserController_1.login);
router.post("/addFav", validate_1.upload.single("image"), validate_1.handleMulterError, UserController_1.addFav);
// router.put("/updateFav/:id", uploadOptional.single("image"), handleMulterError, updateFav);
router.put("/updateFav", validate_1.upload.single("image"), validate_1.handleMulterError, UserController_1.updateFav);
router.post("/deleteFav", uploadTest.any(), UserController_1.deleteFav);
router.get("/getAll", UserController_1.getAll);
//     (req, res)=>{
//     res.json({ message: "hello" });
//     // res.send("hello");
// });
// router.post("/movies", addMovie);
// router.put("/movies/:id", deleteFav);
// router.delete("/movies/:id", deleteMovie);
exports.default = router;
