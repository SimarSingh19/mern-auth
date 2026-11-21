import userModel from "../models/user.model.js";
import { getActiveSession } from "../utils/getActiveSession.js";

export async function requireAdmin(req, res, next) {
    try {
        const session = await getActiveSession(req);
        if (!session) {
            return res.status(401).json({message: "Please sign in again."});
        }

        const user = await userModel.findById(session.user).select("role");

        if (!user) {
            return res.status(401).json({message: "User no longer exists."});
        }

        if (user.role !== "admin") {
            return res.status(403).json({message: "Admin access required."});
        }

        return next();
    } catch (error) {
        return next(error);
    }
}