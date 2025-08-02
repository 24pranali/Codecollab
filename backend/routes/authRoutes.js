import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();
router.post("/", signup);
router.put("/", login);

export default router;
