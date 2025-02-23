import { Router } from "express";
import { all } from "../controllers/book.controller";

const router = Router();

router.get("/", all);

export default router;
