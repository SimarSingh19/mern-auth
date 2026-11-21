import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: config.googleUser,
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
        refreshToken: config.googleRefreshToken,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Error setting up email transporter:", error);
    } else {
        console.log("Email transporter is ready to send emails");
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try{
        const info = await transporter.sendMail({
            from: `"Simar Singh" <${config.googleUser}>`,
            to,
            subject,
            text,
            html
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export default transporter;