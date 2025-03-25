import { Request, Response, NextFunction } from "express";

export function validateTask(req: Request, res: Response, next: NextFunction) {
    if (!req.body.title) {
        res.status(400).json({ error: "Missing title" });
        return;
    }
    next();
}