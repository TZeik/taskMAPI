"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateTask_1 = require("../middleware/validateTask");
let tasks = [];
let id = 1;
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.json(tasks);
});
router.post("/", validateTask_1.validateTask, (req, res) => {
    const task = {
        id: id++,
        title: req.body.title,
        director: req.body.director,
        watched: false,
    };
    tasks.push(task);
    res.status(201).json(task);
});
router.put("/:id", (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) {
        res.status(404).json({ error: "Tarea no encontrada." });
        return;
    }
    task.watched = !task.watched;
    res.json(task);
});
router.delete("/:id", (req, res) => {
    tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
    res.status(204).send();
});
exports.default = router;
