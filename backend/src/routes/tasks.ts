import { Router } from "express";
import { Movie } from "../models/Task";
import { validateTask } from "../middleware/validateTask";

let tasks: Movie[] = [];
let id = 1;

const router = Router();

router.get("/", (req, res) => {
    res.json(tasks);
});

router.post("/", validateTask, (req, res) => {
    const task: Movie = {
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

export default router;