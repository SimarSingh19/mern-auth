import crypto from "crypto";
export function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

export function getOtpHtml(otp){
    console.log("OTP HTML generated:", otp);
    return `
        <div style="text-align: center;">
            <h1>Your OTP is</h1>
            <h2>${otp}</h2>
        </div>
    `;
}