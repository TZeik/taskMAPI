"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMoviesFromFile = loadMoviesFromFile;
exports.testMovies = testMovies;
exports.listarPeliculas = listarPeliculas;
exports.agregarPelicula = agregarPelicula;
exports.eliminarPelicula = eliminarPelicula;
exports.editarPelicula = editarPelicula;
exports.marcarPeliculaComoVista = marcarPeliculaComoVista;
exports.iniciarMenu = iniciarMenu;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const chalk_1 = __importDefault(require("chalk"));
const prompt = (0, prompt_sync_1.default)({ sigint: true });
const dataFilePath = path_1.default.join(__dirname, '..', 'data', 'data.json');
const WATCHED = "Vista";
const UNWATCHED = "No Vista";
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
    else {
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
        watched: UNWATCHED,
    }, {
        id: nextId++,
        title: "El Padrino",
        director: "Francis Ford Coppola",
        watched: UNWATCHED,
    }, {
        id: nextId++,
        title: "Interestellar",
        director: "Cristopher Nolan",
        watched: UNWATCHED,
    });
    saveMoviesToFile();
}
function waitAndClear() {
    prompt('Presiona cualquier tecla para continuar...');
    console.clear();
}
function listarPeliculas() {
    if (peliculas.length === 0) {
        console.log(chalk_1.default.red("No hay películas registradas."));
    }
    else {
        console.table(peliculas);
    }
    waitAndClear();
}
function agregarPelicula() {
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
    const nuevaPelicula = {
        id: nextId++,
        title,
        director,
        watched: UNWATCHED,
    };
    peliculas.push(nuevaPelicula);
    console.log(chalk_1.default.green("Película agregada exitosamente."));
    saveMoviesToFile();
    waitAndClear();
}
function eliminarPelicula() {
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
            const peliculaEliminada = peliculas.splice(index, 1);
            console.log(chalk_1.default.green(`La película "${peliculaEliminada[0].title}" ha sido eliminada.`));
            saveMoviesToFile();
        }
    }
    waitAndClear();
}
function editarPelicula() {
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
            if (newTitle) {
                pelicula.title = newTitle;
            }
            const newDirector = prompt(`Ingrese el nuevo director para "${pelicula.director}" (dejar vacío para mantener actual): `);
            if (newDirector) {
                pelicula.director = newDirector;
            }
            console.log(chalk_1.default.green(`La película con ID ${pelicula.id} ha sido actualizada.`));
            saveMoviesToFile();
        }
    }
    waitAndClear();
}
function marcarPeliculaComoVista() {
    if (peliculas.length === 0) {
        console.log(chalk_1.default.red("No hay películas registradas."));
    }
    else {
        console.table(peliculas);
        const idInput = prompt("Ingrese el ID de la película a marcar como vista (1-" + peliculas.length + "): ");
        if (idInput) {
            const id = parseInt(idInput, 10);
            const pelicula = peliculas.find(p => p.id === id);
            if (pelicula) {
                if (pelicula.watched == WATCHED) {
                    console.log(chalk_1.default.cyan(`La película "${pelicula.title}" ha sido marcada como vista.`));
                }
                else {
                    console.log(chalk_1.default.magenta(`La película "${pelicula.title}" ha sido marcada como no vista.`));
                }
                saveMoviesToFile();
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
function iniciarMenu() {
    let opcion;
    do {
        opcion = mostrarMenu();
        if (opcion === null)
            break;
        switch (opcion.trim()) {
            case '1':
                listarPeliculas();
                break;
            case '2':
                agregarPelicula();
                break;
            case '3':
                marcarPeliculaComoVista();
                break;
            case '4':
                eliminarPelicula();
                break;
            case '5':
                editarPelicula();
                break;
            case '6':
                console.log(chalk_1.default.yellow("Saliendo del programa."));
                waitAndClear();
                break;
            default:
                console.log(chalk_1.default.red("Opción no válida, intente de nuevo."));
                waitAndClear();
        }
    } while (opcion !== '6');
}
