
import fs from 'fs';
import path from 'path';
import promptSync from 'prompt-sync';
import chalk from 'chalk';
import { Pelicula } from '../model/model';

const prompt = promptSync({ sigint: true });
const dataFilePath = path.join(__dirname, '..', 'data', 'data.json');

const WATCHED = "Vista";
const UNWATCHED = "No Vista";

let peliculas: Pelicula[] = [];
let nextId = 1;

export function loadMoviesFromFile(): void {
  if (fs.existsSync(dataFilePath)) {
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    try {
      peliculas = JSON.parse(fileContent);
      if (peliculas.length > 0) {
        nextId = Math.max(...peliculas.map(p => p.id)) + 1;
      }
    } catch (error) {
      console.error("Error al parsear el JSON:", error);
      peliculas = [];
    }
  }else{
  }
}

function saveMoviesToFile(): void {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(peliculas, null, 2), 'utf-8');
}

export function testMovies(): void {
  peliculas.push(
    {
      id: nextId++,
      title: "Inception",
      director: "Christopher Nolan",
      watched: UNWATCHED,
    },
    {
      id: nextId++,
      title: "El Padrino",
      director: "Francis Ford Coppola",
      watched: UNWATCHED,
    },
    {
      id: nextId++,
      title: "Interestellar",
      director: "Cristopher Nolan",
      watched: UNWATCHED,
    }
  );
  saveMoviesToFile();
}

function waitAndClear(): void {
  prompt('Presiona cualquier tecla para continuar...');
  console.clear();
}

export function listarPeliculas(): void {
  if (peliculas.length === 0) {
    console.log(chalk.red("No hay películas registradas."));
  } else {
    console.table(peliculas);
  }
  waitAndClear();
}

export function agregarPelicula(): void {
  const title = prompt("Ingrese el título de la película: ");
  if (!title) {
    console.log(chalk.red("Debe introducir un nombre de película válido"));
    waitAndClear();
    return;
  }
  const director = prompt("Ingrese el director de la película: ");
  if (!director) {
    console.log(chalk.red("Debe introducir un nombre de director válido"));
    waitAndClear();
    return;
  }
  const nuevaPelicula: Pelicula = {
    id: nextId++,
    title,
    director,
    watched: UNWATCHED,
  };
  peliculas.push(nuevaPelicula);
  console.log(chalk.green("Película agregada exitosamente."));
  saveMoviesToFile();
  waitAndClear();
}

export function eliminarPelicula(): void {
  if (peliculas.length === 0) {
    console.log(chalk.red("No hay películas registradas."));
  } else {
    console.table(peliculas);
    const idInput = prompt("Ingrese el ID de la película a eliminar: ");
    if (!idInput) {
      console.log(chalk.red("El ID no puede estar vacío"));
      waitAndClear();
      return;
    }
    const id = parseInt(idInput, 10);
    const index = peliculas.findIndex(p => p.id === id);
    if (index === -1) {
      console.log(chalk.red("No se encontró una película con ese ID."));
    } else {
      const peliculaEliminada = peliculas.splice(index, 1);
      console.log(chalk.green(`La película "${peliculaEliminada[0].title}" ha sido eliminada.`));
      saveMoviesToFile();
    }
  }
  waitAndClear();
}

export function editarPelicula(): void {
  if (peliculas.length === 0) {
    console.log(chalk.red("No hay películas registradas."));
  } else {
    console.table(peliculas);
    const idInput = prompt("Ingrese el ID de la película a editar: ");
    if (!idInput) {
      console.log(chalk.red("El ID no puede estar vacío"));
      waitAndClear();
      return;
    }
    const id = parseInt(idInput, 10);
    const pelicula = peliculas.find(p => p.id === id);
    if (!pelicula) {
      console.log(chalk.red("No se encontró una película con ese ID."));
    } else {
      const newTitle = prompt(`Ingrese el nuevo título para "${pelicula.title}" (dejar vacío para mantener actual): `);
      if (newTitle) {
        pelicula.title = newTitle;
      }
      const newDirector = prompt(`Ingrese el nuevo director para "${pelicula.director}" (dejar vacío para mantener actual): `);
      if (newDirector) {
        pelicula.director = newDirector;
      }
      console.log(chalk.green(`La película con ID ${pelicula.id} ha sido actualizada.`));
      saveMoviesToFile();
    }
  }
  waitAndClear();
}

export function marcarPeliculaComoVista(): void {
  if (peliculas.length === 0) {
    console.log(chalk.red("No hay películas registradas."));
  } else {
    console.table(peliculas);
    const idInput = prompt("Ingrese el ID de la película a marcar como vista (1-" + peliculas.length + "): ");
    if (idInput) {
      const id = parseInt(idInput, 10);
      const pelicula = peliculas.find(p => p.id === id);
      if (pelicula) {
        if(pelicula.watched == WATCHED){
          console.log(chalk.cyan(`La película "${pelicula.title}" ha sido marcada como vista.`));
        }else{
          console.log (chalk.magenta(`La película "${pelicula.title}" ha sido marcada como no vista.`));
        }
        saveMoviesToFile();
      } else {
        console.log(chalk.red("No se encontró una película con ese ID."));
      }
    } else {
      console.log(chalk.red("El ID no puede estar vacío"));
    }
  }
  waitAndClear();
}

function mostrarMenu(): string | null {
  const menu = 
`Menú Interactivo:
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

export function iniciarMenu(): void {
  let opcion: string | null;
  do {
    opcion = mostrarMenu();
    if (opcion === null) break;
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
        console.log(chalk.yellow("Saliendo del programa."));
        waitAndClear();
        break;
      default:
        console.log(chalk.red("Opción no válida, intente de nuevo."));
        waitAndClear();
    }
  } while (opcion !== '6');
}
