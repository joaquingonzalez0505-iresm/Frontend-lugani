// api.js
const BASE_URL = "http://localhost:8000"; // Asegurate de usar la URL de tu backend

export async function getProductos({ page = 0, limit = 5, nombre = "" } = {}) {
  // Construimos los Query Params requeridos
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Solo agregamos 'nombre' si el usuario escribió algo
  if (nombre.trim() !== "") {
    params.append("nombre", nombre);
  }

  const response = await fetch(`${BASE_URL}/productos?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Error al obtener los productos del servidor");
  }

  return await response.json();
}