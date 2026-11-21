export function validateEmail(req, res, next) {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({message: "Email is required."});
    }

    return next();
}