import { getActiveSession } from "../utils/getActiveSession.js";

export async function requireAuth(req, res, next) {
    try {
        const session = await getActiveSession(req);
        if (!session) {
            return res.status(401).json({message: "Please sign in again."});
        }
        req.session = session;

        return next();
    } catch (error) {
        return next(error);
    }
}