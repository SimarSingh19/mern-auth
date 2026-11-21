import app from "./src/app.js";
import connectDB from "./src/config/database.js";
// import { startSessionCleanup } from "./src/jobs/sessionCleanup.js";

try {
    await connectDB();
    // startSessionCleanup();

    const server = app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    server.on("error", (error) => {
        console.error("Server failed:", error.message);
        process.exit(1);
    });
} catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
}