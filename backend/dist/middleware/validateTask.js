"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTask = validateTask;
function validateTask(req, res, next) {
    if (!req.body.title) {
        res.status(400).json({ error: "Missing title" });
        return;
    }
    next();
}
