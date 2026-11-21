export function validateLogin(req, res, next) {
    const { email, password } = req.body ?? {};

    if ( typeof email !== "string" || typeof password !== "string" || !email.trim() || !password ) {
        return res.status(400).json({message: "Valid email and password are required"});
    }

    return next();
}