import fs from 'fs';
import path from 'path';
import promptSync from 'prompt-sync';
import chalk from 'chalk';
import { Movie } from '../models/Task';

const prompt = promptSync({ sigint: true });
const dataFilePath = path.join(__dirname, '..', 'data', 'data.json');

let peliculas: Movie[] = [];
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
      watched: false,
    },
    {
      id: nextId++,
      title: "El Padrino",
      director: "Francis Ford Coppola",
      watched: false,
    },
    {
      id: nextId++,
      title: "Interestellar",
      director: "Cristopher Nolan",
      watched: false,
    }
  );
  saveMoviesToFile();
}

function waitAndClear(): void {
  prompt('Presiona cualquier tecla para continuar...');
  console.clear();
}

export async function actualizarPeliculasDesdeServidor(): Promise<void> {
  try {
    const response = await fetch("http://localhost:3000/tasks");
    const moviesFromServer: Movie[] = (await response.json()) as Movie[];
    peliculas = moviesFromServer;
    if (peliculas.length > 0) {
      nextId = Math.max(...peliculas.map(p => p.id)) + 1;
    } else {
      nextId = 1;
    }
  } catch (error) {
  }
}

export async function listarPeliculas(): Promise<void> {
  await actualizarPeliculasDesdeServidor();
  if (peliculas.length === 0) {
    console.log(chalk.red("No hay películas registradas."));
  } else {
    console.table(peliculas);
  }
  waitAndClear();
}

export async function agregarPelicula(): Promise<void> {
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
      const nuevaPelicula: Movie = (await response.json()) as Movie;
      console.log(chalk.green("Película agregada exitosamente en el servidor."));
      await actualizarPeliculasDesdeServidor();
      saveMoviesToFile();
    } else {
      console.error(chalk.red("Error al agregar la película en el servidor."));
    }
  } catch (error) {
  }
  await syncMoviesToServer();
  waitAndClear();
}

export async function eliminarPelicula(): Promise<void> {
  await actualizarPeliculasDesdeServidor();
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
      try {
        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          console.log(chalk.green("Película eliminada en el servidor."));
          await actualizarPeliculasDesdeServidor();
          saveMoviesToFile();
        } else {
          console.error(chalk.red("Error al eliminar la película en el servidor."));
        }
      } catch (error) {
      }
    }
  }
  await syncMoviesToServer();
  waitAndClear();
}

export async function editarPelicula(): Promise<void> {
  await actualizarPeliculasDesdeServidor();
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
          console.log(chalk.green(`La película con ID ${id} ha sido actualizada en el servidor.`));
          await actualizarPeliculasDesdeServidor();
          saveMoviesToFile();
        } else {
          console.error(chalk.red("Error al actualizar la película en el servidor."));
        }
      } catch (error) {
      }
    }
  }
  await syncMoviesToServer();
  waitAndClear();
}

export async function marcarPeliculaComoVista(): Promise<void> {
  await actualizarPeliculasDesdeServidor();
  if (peliculas.length === 0) {
    console.log(chalk.red("No hay películas registradas."));
  } else {
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
            console.log(chalk.green(`La película "${pelicula.title}" ha sido actualizada en el servidor.`));
            await actualizarPeliculasDesdeServidor();
            saveMoviesToFile();
          } else {
            console.error(chalk.red("Error al actualizar la película en el servidor."));
          }
        } catch (error) {
        }
      } else {
        console.log(chalk.red("No se encontró una película con ese ID."));
      }
    } else {
      console.log(chalk.red("El ID no puede estar vacío"));
    }
  }
  waitAndClear();
}

export async function syncMoviesToServer(): Promise<void> {
  try {
    const response = await fetch("http://localhost:3000/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(peliculas)
    });
    if (!response.ok) {
      console.error(chalk.red("Error al actualizar las películas en el servidor"));
    } else {
      console.log(chalk.green("Películas sincronizadas exitosamente con el servidor"));
    }
  } catch (error) {
  }
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

export async function iniciarMenu(): Promise<void> {
  let opcion: string | null;
  do {
    opcion = mostrarMenu();
    if (opcion === null) break;
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
        console.log(chalk.yellow("Saliendo del programa."));
        waitAndClear();
        break;
      default:
        console.log(chalk.red("Opción no válida, intente de nuevo."));
        waitAndClear();
    }
  } while (opcion !== '6');
}
