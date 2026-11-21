import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

if(!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

if(!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in the environment variables");
}

if(!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is not defined in the environment variables");
}

if(!process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error("GOOGLE_REFRESH_TOKEN is not defined in the environment variables");
}

if(!process.env.GOOGLE_USER) {
  throw new Error("GOOGLE_USER is not defined in the environment variables");
}

if(!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in the environment variables");
}

const config = {
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    googleUser: process.env.GOOGLE_USER,
    imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY
};

export default config;