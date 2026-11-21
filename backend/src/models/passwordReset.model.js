import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
    attemptsLeft: {
        type: Number,
        default: 5,
    },
});

export default mongoose.model("PasswordReset", passwordResetSchema);