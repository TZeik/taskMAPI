import express from "express";
import taskRoutes from "./routes/tasks";
import { logger } from "./middleware/logger";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

const requestLogs: { method: string; url: string; timestamp: string }[] = [];

app.use((req, res, next) => {
  requestLogs.push({
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  next();
});

app.get("/logs", (req, res) => {
  res.json(requestLogs);
});

app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
