export function validateUserId(req, res, next) {
    const { userId } = req.params;
    
    if (typeof userId !== "string" || !/^[a-fA-F0-9]{24}$/.test(userId)) {
        return res.status(400).json({message: "Invalid user ID."});
    }

    return next();
}