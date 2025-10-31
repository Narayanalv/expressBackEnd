import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "../route/routes";
import { verifyUser } from "../controllers/authMiddleware";

const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(["/api/addFav", "/api/deleteFav", "/api/updateFav","/api/getAll"], verifyUser);
app.use("/api/", router);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
