export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    if (error.code === 11000) {
        return res.status(409).json({message: "Username or email already exists"});
    }
    if (error.name === "ValidationError") {
        for (const [field, detail] of Object.entries(error.errors ?? {})) {
            console.error(`Profile validation failed: ${field} (${detail.kind})`);
        }
        return res.status(400).json({message: "Please check the submitted fields"});
    }
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({message: "Invalid JSON body"});
    }
    console.error(error);
    return res.status(500).json({message: "Something went wrong"});
}