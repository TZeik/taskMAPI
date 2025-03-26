"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMoviesFromFile = loadMoviesFromFile;
exports.testMovies = testMovies;
exports.actualizarPeliculasDesdeServidor = actualizarPeliculasDesdeServidor;
exports.listarPeliculas = listarPeliculas;
exports.agregarPelicula = agregarPelicula;
exports.eliminarPelicula = eliminarPelicula;
exports.editarPelicula = editarPelicula;
exports.marcarPeliculaComoVista = marcarPeliculaComoVista;
exports.syncMoviesToServer = syncMoviesToServer;
exports.iniciarMenu = iniciarMenu;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const chalk_1 = __importDefault(require("chalk"));
const prompt = (0, prompt_sync_1.default)({ sigint: true });
const dataFilePath = path_1.default.join(__dirname, '..', 'data', 'data.json');
let peliculas = [];
let nextId = 1;
function loadMoviesFromFile() {
    if (fs_1.default.existsSync(dataFilePath)) {
        const fileContent = fs_1.default.readFileSync(dataFilePath, 'utf-8');
        try {
            peliculas = JSON.parse(fileContent);
            if (peliculas.length > 0) {
                nextId = Math.max(...peliculas.map(p => p.id)) + 1;
            }
        }
        catch (error) {
            console.error("Error al parsear el JSON:", error);
            peliculas = [];
        }
    }
}
function saveMoviesToFile() {
    const dir = path_1.default.dirname(dataFilePath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    fs_1.default.writeFileSync(dataFilePath, JSON.stringify(peliculas, null, 2), 'utf-8');
}
function testMovies() {
    peliculas.push({
        id: nextId++,
        title: "Inception",
        director: "Christopher Nolan",
        watched: false,
    }, {
        id: nextId++,
        title: "El Padrino",
        director: "Francis Ford Coppola",
        watched: false,
    }, {
        id: nextId++,
        title: "Interestellar",
        director: "Cristopher Nolan",
        watched: false,
    });
    saveMoviesToFile();
}
function waitAndClear() {
    prompt('Presiona cualquier tecla para continuar...');
    console.clear();
}
async function actualizarPeliculasDesdeServidor() {
    try {
        const response = await fetch("http://localhost:3000/tasks");
        const moviesFromServer = (await response.json());
        peliculas = moviesFromServer;
        if (peliculas.length > 0) {
            nextId = Math.max(...peliculas.map(p => p.id)) + 1;
        }
        else {
            nextId = 1;
        }
    }
    catch (error) {
    }
}
async function listarPeliculas() {
    await actualizarPeliculasDesdeServidor();
    if (peliculas.length === 0) {
        console.log(chalk_1.default.red("No hay películas registradas."));
    }
    else {
        console.table(peliculas);
    }
    waitAndClear();
}
async function agregarPelicula() {
    const title = prompt("Ingrese el título de la película: ");
    if (!title) {
        console.log(chalk_1.default.red("Debe introducir un nombre de película válido"));
        waitAndClear();
        return;
    }
    const director = prompt("Ingrese el director de la película: ");
    if (!director) {
        console.log(chalk_1.default.red("Debe introducir un nombre de director válido"));
        waitAndClear();
        return;
    }
    try {
        const response = await fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                director
            })
        });
        if (response.ok) {
            const nuevaPelicula = (await response.json());
            console.log(chalk_1.default.green("Película agregada exitosamente en el servidor."));
            await actualizarPeliculasDesdeServidor();
            saveMoviesToFile();
        }
        else {
            console.error(chalk_1.default.red("Error al agregar la película en el servidor."));
        }
    }
    catch (error) {
    }
    await syncMoviesToServer();
    waitAndClear();
}
async function eliminarPelicula() {
    await actualizarPeliculasDesdeServidor();
    if (peliculas.length === 0) {
        console.log(chalk_1.default.red("No hay películas registradas."));
    }
    else {
        console.table(peliculas);
        const idInput = prompt("Ingrese el ID de la película a eliminar: ");
        if (!idInput) {
            console.log(chalk_1.default.red("El ID no puede estar vacío"));
            waitAndClear();
            return;
        }
        const id = parseInt(idInput, 10);
        const index = peliculas.findIndex(p => p.id === id);
        if (index === -1) {
            console.log(chalk_1.default.red("No se encontró una película con ese ID."));
        }
        else {
            try {
                const response = await fetch(`http://localhost:3000/tasks/${id}`, {
                    method: "DELETE"
                });
                if (response.ok) {
                    console.log(chalk_1.default.green("Película eliminada en el servidor."));
                    await actualizarPeliculasDesdeServidor();
                    saveMoviesToFile();
                }
                else {
                    console.error(chalk_1.default.red("Error al eliminar la película en el servidor."));
                }
            }
            catch (error) {
            }
        }
    }
    await syncMoviesToServer();
    waitAndClear();
}
async function editarPelicula() {
    await actualizarPeliculasDesdeServidor();
    if (peliculas.length === 0) {
        console.log(chalk_1.default.red("No hay películas registradas."));
    }
    else {
        console.table(peliculas);
        const idInput = prompt("Ingrese el ID de la película a editar: ");
        if (!idInput) {
            console.log(chalk_1.default.red("El ID no puede estar vacío"));
            waitAndClear();
            return;
        }
        const id = parseInt(idInput, 10);
        const pelicula = peliculas.find(p => p.id === id);
        if (!pelicula) {
            console.log(chalk_1.default.red("No se encontró una película con ese ID."));
        }
        else {
            const newTitle = prompt(`Ingrese el nuevo título para "${pelicula.title}" (dejar vacío para mantener actual): `);
            const newDirector = prompt(`Ingrese el nuevo director para "${pelicula.director}" (dejar vacío para mantener actual): `);
            try {
                const response = await fetch(`http://localhost:3000/tasks/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: newTitle || pelicula.title,
                        director: newDirector || pelicula.director
                    })
                });
                if (response.ok) {
                    console.log(chalk_1.default.green(`La película con ID ${id} ha sido actualizada en el servidor.`));
                    await actualizarPeliculasDesdeServidor();
                    saveMoviesToFile();
                }
                else {
                    console.error(chalk_1.default.red("Error al actualizar la película en el servidor."));
                }
            }
            catch (error) {
            }
        }
    }
    await syncMoviesToServer();
    waitAndClear();
}
async function marcarPeliculaComoVista() {
    await actualizarPeliculasDesdeServidor();
    if (peliculas.length === 0) {
        console.log(chalk_1.default.red("No hay películas registradas."));
    }
    else {
        console.table(peliculas);
        const idInput = prompt("Ingrese el ID de la película a marcar como vista: ");
        if (idInput) {
            const id = parseInt(idInput, 10);
            const pelicula = peliculas.find(p => p.id === id);
            if (pelicula) {
                try {
                    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
                        method: "PUT"
                    });
                    if (response.ok) {
                        console.log(chalk_1.default.green(`La película "${pelicula.title}" ha sido actualizada en el servidor.`));
                        await actualizarPeliculasDesdeServidor();
                        saveMoviesToFile();
                    }
                    else {
                        console.error(chalk_1.default.red("Error al actualizar la película en el servidor."));
                    }
                }
                catch (error) {
                }
            }
            else {
                console.log(chalk_1.default.red("No se encontró una película con ese ID."));
            }
        }
        else {
            console.log(chalk_1.default.red("El ID no puede estar vacío"));
        }
    }
    waitAndClear();
}
async function syncMoviesToServer() {
    try {
        const response = await fetch("http://localhost:3000/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(peliculas)
        });
        if (!response.ok) {
            console.error(chalk_1.default.red("Error al actualizar las películas en el servidor"));
        }
        else {
            console.log(chalk_1.default.green("Películas sincronizadas exitosamente con el servidor"));
        }
    }
    catch (error) {
    }
}
function mostrarMenu() {
    const menu = `Menú Interactivo:
  1. Listar Películas
  2. Agregar Película
  3. Marcar Película como Vista/No Vista
  4. Eliminar Película
  5. Editar Película
  6. Salir
Elige una opción:`;
    console.log(menu);
    const respuesta = prompt('');
    console.clear();
    return respuesta;
}
async function iniciarMenu() {
    let opcion;
    do {
        opcion = mostrarMenu();
        if (opcion === null)
            break;
        switch (opcion.trim()) {
            case '1':
                await listarPeliculas();
                break;
            case '2':
                await agregarPelicula();
                break;
            case '3':
                await marcarPeliculaComoVista();
                break;
            case '4':
                await eliminarPelicula();
                break;
            case '5':
                await editarPelicula();
                break;
            case '6':
                saveMoviesToFile();
                console.log(chalk_1.default.yellow("Saliendo del programa."));
                waitAndClear();
                break;
            default:
                console.log(chalk_1.default.red("Opción no válida, intente de nuevo."));
                waitAndClear();
        }
    } while (opcion !== '6');
}
