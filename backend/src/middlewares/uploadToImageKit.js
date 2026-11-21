import { toFile } from "@imagekit/nodejs";
import imagekit from "../config/imagekit.js";

export async function uploadToImageKit(req, res, next) {
    if (!req.file) {
        return next();
    }

    try {
        req.uploadedPhoto = await imagekit.files.upload({
            file: await toFile(
                req.file.buffer,
                req.file.originalname,
            ),
            fileName: req.file.originalname,
            folder: "/profiles",
            checks: '"file.mime" IN ["image/jpeg", "image/png", "image/webp"]',
        });

        return next();
    } catch (error) {
        return next(error);
    }
}