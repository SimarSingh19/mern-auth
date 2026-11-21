import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [ true, "Email is required" ]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required" ]
    },
    otpHash: {
        type: String,
        required: [true, "OTP is required"]
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000),
        expires: 0,
    },
    attemptsLeft: {
        type: Number,
        default: 5,
        min: 0,
    },
}, { timestamps: true });

const otpModel = mongoose.model("Otp", otpSchema);

export default otpModel;