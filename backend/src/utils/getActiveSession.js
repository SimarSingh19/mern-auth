import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";

export async function getActiveSession(req) {
    const token = req.cookies?.accessToken;
    if (!token) {
        return null;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, config.jwtSecret);
    } catch {
        return null;
    }

    const objectIdPattern = /^[a-fA-F0-9]{24}$/;

    if (!decoded || typeof decoded !== "object" || typeof decoded.id !== "string" || typeof decoded.sessionId !== "string" ||
        !objectIdPattern.test(decoded.id) || !objectIdPattern.test(decoded.sessionId)) {
        return null;
    }

    return sessionModel.findOne({
        _id: decoded.sessionId,
        user: decoded.id,
        revoked: false,
        expiresAt: { $gt: new Date() },
    });
}