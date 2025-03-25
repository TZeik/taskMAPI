"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./services/service");
console.clear();
(0, service_1.loadMoviesFromFile)();
(0, service_1.iniciarMenu)();
