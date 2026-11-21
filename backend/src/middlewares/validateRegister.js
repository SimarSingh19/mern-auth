export function validateRegister(req, res, next) {
    const { username, email, password } = req.body ?? {};

    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string" || !username.trim() ||
        !email.trim() || !password) {
        return res.status(400).json({message: "Username, email, and password are required"});
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({message: "Password must be at least 8 characters and at most 72 bytes"});
    }

    return next();
}