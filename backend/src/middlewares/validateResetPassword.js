export function validateResetPassword(req, res, next) {
    const { email, otp, newPassword } = req.body ?? {};

    if ( typeof email !== "string" || !email.trim() || typeof otp !== "string" ||
        !/^[0-9]{6}$/.test(otp) || typeof newPassword !== "string") {
        return res.status(400).json({
            message: "Email, a 6-digit OTP, and a new password are required",
        });
    }

    if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
        return res.status(400).json({
            message: "Password must be at least 8 characters and at most 72 bytes",
        });
    }

    return next();
}