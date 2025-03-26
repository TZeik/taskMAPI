"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEventsToAll = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const logger_1 = require("./middleware/logger");
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.use(logger_1.logger);
const clients = [];
app.get("/events", (req, res) => {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });
    res.flushHeaders();
    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);
    console.log(`Cliente conectado: ${clientId}`);
    req.on("close", () => {
        console.log(`Cliente desconectado: ${clientId}`);
        const index = clients.findIndex((client) => client.id === clientId);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });
});
const sendEventsToAll = (data) => {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};
exports.sendEventsToAll = sendEventsToAll;
app.use("/tasks", tasks_1.default);
const server = http_1.default.createServer(app);
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
