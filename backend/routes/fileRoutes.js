import express from "express";
import { fetchFilesByRoom } from "../controllers/fileController.js";

const router = express.Router();
router.get("/", fetchFilesByRoom);

export default router;
