export function validateVerifyEmail(req, res, next) {
    const { verificationId, otp } = req.body ?? {};

    if (typeof verificationId !== "string" || !/^[a-fA-F0-9]{24}$/.test(verificationId) ||
        typeof otp !== "string" || !/^[0-9]{6}$/.test(otp)) {
        return res.status(400).json({message: "A valid verification ID and 6-digit OTP are required."});
    }

    return next();
}