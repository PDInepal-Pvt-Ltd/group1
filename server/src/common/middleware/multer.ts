import path from "node:path";
import type { Request } from "express";
import multer, { type StorageEngine } from "multer";
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, path.resolve(__dirname, "../../public/temp")); // Construct the absolute path
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});