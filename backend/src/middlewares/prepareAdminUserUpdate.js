export function prepareAdminUserUpdate(req, res, next) {
    const body = req.body ?? {};

    const allowedFields = [
        "role",
        "age",
        "condition",
        "weight",
        "gender",
        "city",
        "bio",
    ];

    const updates = {};
    const unsetFields = {};

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

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

    if (
        Object.keys(updates).length === 0 &&
        Object.keys(unsetFields).length === 0
    ) {
        return res.status(400).json({
            message: "Send at least one field to update.",
        });
    }

    req.adminUserUpdate = {
        updates,
        unsetFields,
    };

    return next();
}