import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import otpModel from "../models/otp.model.js";
import passwordResetModel from "../models/passwordReset.model.js";
import config from "../config/config.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.service.js";
import {generateOtp, getOtpHtml} from "../utils/utils.js";

import { getActiveSession } from "../utils/getActiveSession.js";

function clearAccessTokenCookie(res) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth",
    });
}

function hashResetOtp(userId, otp) {
    return crypto.createHmac("sha256", config.jwtSecret).update(`password-reset:${userId}:${otp}`).digest("hex");
}

export async function register(req, res, next) {
    try {
        const { username, email, password } = req.body ?? {};

        const cleanEmail = email.trim();

        const isAlreadyExists = await userModel.findOne({$or: [{ username }, { email: cleanEmail }]});

        if (isAlreadyExists) {
            return res.status(409).json({message: "Username or email already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await userModel.create({username, email: cleanEmail, password: hashedPassword});

        const otp = generateOtp();
        const html = getOtpHtml(otp);

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        const otpDoc = await otpModel.create({email: cleanEmail, user: user._id, otpHash});

        try {
            await sendEmail(
                cleanEmail,
                "OTP Verification",
                `Your OTP is: ${otp}`,
                html,
            );
        } catch (emailError) {
            await otpModel.deleteMany({ user: user._id });
            await userModel.deleteOne({ _id: user._id });
            return res.status(503).json({message: "Verification email could not be sent. Please register again.",});
        }

        return res.status(201).json({
            message: "User registered successfully",
            verificationId: otpDoc._id.toString(),
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function login(req, res) {
    const { email, password } = req.body ?? {};

    const cleanEmail = email.trim();
    const user = await userModel.findOne({ email: cleanEmail });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.verified) {
        return res.status(403).json({ message: "Please verify your email",code: "EMAIL_NOT_VERIFIED" });
    }

    const expiresAtSeconds = Math.floor(Date.now() / 1000) + 5 * 60;
    const expiresAt = new Date(expiresAtSeconds * 1000);

    const session = await sessionModel.create({
        user: user._id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        expiresAt: expiresAt,
    });

    const accessToken = jwt.sign({ id: user._id, sessionId: session._id, exp: expiresAtSeconds },config.jwtSecret );

    res.cookie("accessToken", accessToken);

    res.status(200).json({ message: "Login successful", expiresAt, user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        role: user.role
    }});
}

export async function getMe(req, res) {
    if (!req.cookies?.accessToken) {
        return res.status(204).end();
    }

    const session = await getActiveSession(req);
    if (!session) {
        return res.status(401).json({message: "Session expired. Please log in again.",});
    }

    const user = await userModel.findById(session.user);
    if (!user) {
        return res.status(401).json({message: "User no longer exists."});
    }

    return res.status(200).json({
        message: "User found",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified,
            role: user.role
        },
        profile: {
            age: user.age ?? null,
            condition: user.condition ?? null,
            weight: user.weight ?? null,
            gender: user.gender ?? null,
            city: user.city ?? "",
            bio: user.bio ?? "",
            profilePicture: user.profilePicture ?? null,
        },
        expiresAt: session.expiresAt,
    });
}

export async function logout(req, res) {
    const session = await getActiveSession(req);
    if (!session) {
        clearAccessTokenCookie(res);
        return res.status(401).json({message: "Session expired. Please log in again."});
    }

    await sessionModel.updateOne(
        { _id: session._id },
        { $set: { revoked: true } }
    );

    clearAccessTokenCookie(res);
    return res.status(200).json({message: "Logout successful"});
}

export async function logoutAll(req, res) {
    const session = await getActiveSession(req);
    if (!session) {
        clearAccessTokenCookie(res);
        return res.status(401).json({message: "Session expired. Please log in again."});
    }

    await sessionModel.updateMany(
        { user: session.user, revoked: false },
        { $set: { revoked: true } }
    );

    clearAccessTokenCookie(res);
    return res.status(200).json({message: "Logout from all sessions successful"});
}

export async function sendVerificationOtp(req, res, next) {
    const { email } = req.body ?? {};

    try {
        const user = await userModel.findOne({email: email.trim(), verified: false});
        if (!user) {
            return res.status(200).json({message: "If verification is needed, a code will be sent.",verificationId: null});
        }

        const previousOtp = await otpModel.findOne({ user: user._id }).sort({ createdAt: -1 });

        if (previousOtp) {
            const timePassed = Date.now() - previousOtp.createdAt.getTime();
            const secondsLeft = Math.ceil((10_000 - timePassed) / 1000);
            if (secondsLeft > 0) {
                return res.status(429).json({message: "Please wait before requesting another OTP.",retryAfterSeconds: secondsLeft});
            }
        }

        const otp = generateOtp();
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const otpDoc = await otpModel.create({
            email: user.email,
            user: user._id,
            otpHash,
            attemptsLeft: 5,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        try {
            await sendEmail( user.email, "OTP Verification", `Your verification code is ${otp}. It expires in 10 minutes.`, getOtpHtml(otp) );
        } catch (error) {
            await otpModel.deleteOne({ _id: otpDoc._id });
            throw error;
        }

        await otpModel.deleteMany({user: user._id, _id: { $lt: otpDoc._id }});

        return res.status(200).json({message: "Verification code sent. Check your inbox.",verificationId: otpDoc._id.toString()});

    } catch (error) {
        return next(error);
    }
}

export async function verifyEmail(req, res, next) {
    const { verificationId, otp } = req.body ?? {};

    const invalidMessage = "Invalid or expired OTP. Request a new code.";

    try {
        const otpDoc = await otpModel.findOneAndUpdate(
            {
                _id: verificationId,
                expiresAt: { $gt: new Date() },
            },
            { $inc: { attemptsLeft: -1 } },
            { returnDocument: "after" }
        );

        
        if (!otpDoc) {
            return res.status(400).json({message: invalidMessage});
        }

        if(otpDoc.attemptsLeft < 0){
            return res.status(400).json({message: "Reached the max limit to verify, apply again after some time"})
        }

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        if (otpHash !== otpDoc.otpHash) {
            return res.status(400).json({message: invalidMessage,});
        }

        const user = await userModel.findByIdAndUpdate(otpDoc.user,
            { $set: { verified: true } },
            { returnDocument: "after" },
        );

        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        await otpModel.deleteMany({ user: user._id });

        return res.status(200).json({message: "Email verified successfully. Please sign in."});
    } catch (error) {
        return next(error);
    }
}

export async function forgotPassword(req, res, next) {
    const { email } = req.body ?? {};
    const message = "If the email is registered and verified, a password reset code will be sent.";

    try {
        const user = await userModel.findOne({email: email.trim()});

        if (!user) {
            return res.status(200).json({ message });
        }
        if (!user.verified) {
            return res.status(403).json({message: "Please verify your email first.",code: "EMAIL_NOT_VERIFIED"});
        }

        const otp = generateOtp();
        const otpHash = hashResetOtp(user._id, otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await passwordResetModel.updateOne(
            { user: user._id },
            { $set: { otpHash, expiresAt, attemptsLeft: 5 } },
            { upsert: true }
        );

        await sendEmail(user.email, "Reset your password", `Your password reset code is ${otp}. It expires in 10 minutes.`,getOtpHtml(otp));

        return res.status(200).json({message});
    } catch (error) {
        return next(error);
    }
}

export async function resetPassword(req, res, next) {
    const { email, otp, newPassword } = req.body ?? {};

    const invalidCodeMessage = "Invalid or expired code. Request a new reset code.";

    try {
        const user = await userModel.findOne({email: email.trim(),verified: true});

        if (!user) {
            return res.status(400).json({ message: invalidCodeMessage });
        }

        const reset = await passwordResetModel.findOneAndUpdate(
            {
                user: user._id,
                expiresAt: { $gt: new Date() },
                attemptsLeft: { $gt: 0 },
            },
            { $inc: { attemptsLeft: -1 } },
            { returnDocument: "after" },
        );

        if (!reset) {
            return res.status(400).json({ message: invalidCodeMessage });
        }

        const enteredOtpHash = hashResetOtp(user._id, otp);

        if (enteredOtpHash !== reset.otpHash) {
            return res.status(400).json({ message: invalidCodeMessage });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const usedCode = await passwordResetModel.findOneAndDelete({
            _id: reset._id,
            otpHash: enteredOtpHash,
            expiresAt: { $gt: new Date() }
        });

        if (!usedCode) {
            return res.status(400).json({ message: invalidCodeMessage });
        }

        await userModel.updateOne({ _id: user._id },
            { $set: { password: hashedPassword } }
        );

        await sessionModel.updateMany({ user: user._id, revoked: false },
            { $set: { revoked: true } }
        );

        return res.status(200).json({message: "Password reset successful. Please sign in again.",});
    } catch (error) {
        return next(error);
    }
}

export async function updateProfile(req, res, next) {
    try {
        const session = req.session;
        const body = req.body ?? {};
        const allowedFields = ["age", "condition", "weight", "gender", "city", "bio"];
        const updates = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (body.age === "") {
            updates.age = null;
        }

        if (body.weight === "") {
            updates.weight = null;
        }

        if (req.uploadedPhoto) {
            updates.profilePicture = req.uploadedPhoto.url;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({message: "Send at least one profile field.",});
        }

        const user = await userModel.findByIdAndUpdate(session.user,
            { $set: updates },
            { runValidators: true, returnDocument: "after" }
        ).select("age condition weight gender city bio profilePicture");

        if (!user) {
            return res.status(404).json({message: "User not found.",});
        }

        return res.status(200).json({message: "Profile updated successfully.", profile: user});
    } catch (error) {
        return next(error);
    }
}

export async function updateProfilePicture(req, res, next) {
    try {
        const session = req.session;
        if (!req.file) {
            return res.status(400).json({message: "Please select a profile picture."});
        }

        const uploadedPhoto = req.uploadedPhoto;
        if (!uploadedPhoto) {
            return res.status(400).json({
                message: "Please select a profile picture.",
            });
        }

        const user = await userModel.findByIdAndUpdate(session.user,
            { $set: { profilePicture: uploadedPhoto.url } },
            { returnDocument: "after" },
        ).select("profilePicture");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            message: "Profile picture updated successfully.",
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        return next(error);
    }
}


export async function listUsers(req, res) {
    const users = await userModel.find().select("username email role verified profilePicture age condition weight gender city bio");
    return res.status(200).json({ users });
}

export async function deleteAdminUser(req, res, next) {
    try {
        const { userId } = req.params;

        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        return next(error);
    }
}

export async function updateAdminUser(req, res, next) {
    try {

        const { userId } = req.params;

        const body = req.body ?? {};
        const allowedFields = ["role","age","condition","weight","gender","city","bio",];

        const updates = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        const unsetFields = {};

        for (const field of ["condition", "gender"]) {
            if (updates[field] === "") {
                unsetFields[field] = "";
                delete updates[field];
            }
        }

        if (updates.age === "") {
            updates.age = null;
        }

        if (updates.weight === "") {
            updates.weight = null;
        }

        if (Object.keys(updates).length === 0 && Object.keys(unsetFields).length === 0) {
            return res.status(400).json({message: "Send at least one field to update.",});
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: updates, $unset: unsetFields },
            { runValidators: true, returnDocument: "after" },
        ).select("username email role verified age condition weight gender city bio profilePicture");

        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        return res.status(200).json({message: "User updated successfully.",user});
    } catch (error) {
        return next(error);
    }
}