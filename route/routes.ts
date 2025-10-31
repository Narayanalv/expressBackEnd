import express from "express";
import { addFav, deleteFav, getAll, login, register, updateFav } from "../controllers/UserController";
import { handleMulterError, upload } from "../controllers/validate";
import multerPkg from "multer";
const uploadTest = multerPkg();

const router = express.Router();

router.post("/register", uploadTest.none(), register)
router.post("/login", uploadTest.none(), login)
router.post("/addFav", upload.single("image"), handleMulterError, addFav);
// router.put("/updateFav/:id", uploadOptional.single("image"), handleMulterError, updateFav);
router.put("/updateFav", upload.single("image"), handleMulterError, updateFav);
router.post("/deleteFav", uploadTest.any(), deleteFav);
router.get("/getAll", getAll);
//     (req, res)=>{
//     res.json({ message: "hello" });
//     // res.send("hello");
// });
// router.post("/movies", addMovie);
// router.put("/movies/:id", deleteFav);
// router.delete("/movies/:id", deleteMovie);

export default router;