import express from "express";
import taskRoutes from "./routes/tasks";
import { logger } from "./middleware/logger";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});