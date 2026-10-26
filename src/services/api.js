import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";
export const API_URL = BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de instancia Axios con interceptor para Bearer token
// ─────────────────────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "";
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const INITIAL_PRODUCTOS = [];

// ─────────────────────────────────────────────────────────────────────────────
// Normalizador de Payload exacto para el esquema FastAPI / SQLite de Render
// Incluye todas las variantes de nombres de campo y conversiones numéricas
// ─────────────────────────────────────────────────────────────────────────────
export function buildProductoPayload(raw = {}) {
  const nombre = raw.nombre || "";
  const descripcion = raw.descripcion || raw.description || "";
  const precio = Number(raw.precio ?? raw.precio_final ?? raw.precioFinal ?? 0);
  const stock = Number(raw.stock ?? 0);
  const cuotas = Number(raw.cuotas ?? raw.cuotas_cantidad ?? 1) || 1;
  const urlImagen = raw.imagen_url || raw.imagen || "";

  return {
    nombre: nombre,
    descripcion: descripcion,
    description: descripcion,
    precio: Number(precio),
    precio_final: Number(precio),
    precioFinal: Number(precio),
    stock: Number(stock),
    cuotas: Number(cuotas || 1),
    cuotas_cantidad: Number(cuotas || 1),
    imagen_url: urlImagen || "",
    imagen: urlImagen || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper para obtener headers con Authorization Bearer desde localStorage
// ─────────────────────────────────────────────────────────────────────────────
export function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Peticiones a /productos (GET, POST, PUT, DELETE)
// ─────────────────────────────────────────────────────────────────────────────
export async function getProductos({ page = 0, limit = 100, nombre = "" } = {}) {
  try {
    const skip = page * limit;
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (nombre && nombre.trim() !== "") {
      params.append("nombre", nombre.trim());
    }

    const headers = getAuthHeaders();

    let response = await fetch(`${BASE_URL}/productos/?${params.toString()}`, {
      headers,
    });

    if (response.status === 404) {
      response = await fetch(`${BASE_URL}/productos?${params.toString()}`, {
        headers,
      });
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || data.productos || []);
  } catch (error) {
    console.error("Error al obtener productos reales del backend de Render:", error);
    return [];
  }
}

export async function crearProducto(prodPayload, token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const safePayload = buildProductoPayload(prodPayload);

    let response = await fetch(`${BASE_URL}/productos/`, {
      method: "POST",
      headers,
      body: JSON.stringify(safePayload),
    });

    if (response.status === 404) {
      response = await fetch(`${BASE_URL}/productos`, {
        method: "POST",
        headers,
        body: JSON.stringify(safePayload),
      });
    }

    if (!response.ok) {
      let errorDetail = `Error al crear producto: ${response.status}`;
      try {
        const errBody = await response.json();
        if (errBody.detail) {
          errorDetail = Array.isArray(errBody.detail)
            ? errBody.detail.map(e => `Campo '${e.loc?.join(".")}': ${e.msg}`).join(" | ")
            : String(errBody.detail);
        }
      } catch (_) { }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (error) {
    console.error("[crearProducto] Error:", error);
    throw error;
  }
}

export async function actualizarProducto(id, prodPayload, token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const safePayload = buildProductoPayload(prodPayload);
    const candidateUrls = [
      `${BASE_URL}/productos/${id}`,
      `${BASE_URL}/productos/${id}/`,
      `${BASE_URL}/producto/${id}`,
      `${BASE_URL}/producto/${id}/`,
    ];

    let response = null;
    let lastErrorDetail = null;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers,
          body: JSON.stringify(safePayload),
        });

        if (res.ok) {
          return await res.json();
        }

        response = res;
        try {
          const errData = await res.json();
          if (errData.detail) {
            lastErrorDetail = Array.isArray(errData.detail)
              ? errData.detail.map(e => `Campo '${e.loc?.join(".")}': ${e.msg}`).join(" | ")
              : String(errData.detail);
          }
        } catch (_) { }

        if (res.status !== 404) {
          break;
        }
      } catch (_) { }
    }

    const errorMsg = lastErrorDetail || `Error ${response?.status || 404} al actualizar producto #${id}`;
    throw new Error(errorMsg);
  } catch (error) {
    console.error("[actualizarProducto] Error:", error);
    throw error;
  }
}

export async function eliminarProducto(id, token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const candidateUrls = [
      `${BASE_URL}/productos/${id}`,
      `${BASE_URL}/productos/${id}/`,
      `${BASE_URL}/producto/${id}`,
      `${BASE_URL}/producto/${id}/`,
    ];

    let response = null;
    let lastErrorDetail = null;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          method: "DELETE",
          headers,
        });

        if (res.ok || res.status === 200 || res.status === 204) {
          return await res.json().catch(() => ({ success: true, id }));
        }

        // 404 → el producto ya no existe en la BD: se considera borrado exitoso
        if (res.status === 404) {
          return { success: true, id };
        }

        response = res;
        try {
          const errData = await res.json();
          if (errData.detail) {
            lastErrorDetail = Array.isArray(errData.detail)
              ? errData.detail.map(e => `Campo '${e.loc?.join(".")}': ${e.msg}`).join(" | ")
              : String(errData.detail);
          }
        } catch (_) { }

        break;
      } catch (_) { }
    }

    const errorMsg = lastErrorDetail || `Error ${response?.status || 404} al eliminar producto #${id}`;
    throw new Error(errorMsg);
  } catch (error) {
    console.error("Error en eliminarProducto:", error);
    throw error;
  }
}

export async function subirImagenProducto(file, token) {
  try {
    const formData = new FormData();
    formData.append("archivo", file);
    const authToken = token || localStorage.getItem("token") || "";
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const response = await fetch(`${BASE_URL}/productos/upload-imagen`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir imagen: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en subirImagenProducto:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Autenticación y Usuarios
// ─────────────────────────────────────────────────────────────────────────────
export async function loginUser(credentials, password) {
  try {
    const payload = typeof credentials === "object" && credentials !== null
      ? credentials
      : { email: credentials, password };

    let res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      throw new Error(`Error en inicio de sesión: ${res.status}`);
    }

    const data = await res.json();
    const response = { data };

    localStorage.setItem('token', response.data.access_token || response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user || response.data.usuario || response.data));

    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    let res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (res.status === 404) {
      res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    }

    if (!res.ok) {
      throw new Error(`Error en el registro: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

export async function getPerfil(token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await fetch(`${BASE_URL}/perfil`, { headers });

    if (!response.ok) {
      throw new Error(`Error al obtener perfil: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getPerfil:", error);
    throw error;
  }
}

export async function getMisDatos(token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await fetch(`${BASE_URL}/usuarios/me`, { headers });

    if (!response.ok) {
      throw new Error(`Error al obtener datos del usuario: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getMisDatos:", error);
    throw error;
  }
}

export async function exportarMisDatos(token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await fetch(`${BASE_URL}/usuarios/exportar`, { headers });

    if (!response.ok) {
      throw new Error(`Error al exportar datos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en exportarMisDatos:", error);
    throw error;
  }
}

export async function eliminarCuenta(token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar cuenta: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en eliminarCuenta:", error);
    throw error;
  }
}

export async function crearPedido(pedidoData, token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    const response = await fetch(`${BASE_URL}/pedidos/`, {
      method: "POST",
      headers,
      body: JSON.stringify(pedidoData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear pedido: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en crearPedido:", error);
    throw error;
  }
}

export async function getMisPedidos(token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await fetch(`${BASE_URL}/pedidos/`, { headers });

    if (!response.ok) {
      throw new Error(`Error al obtener pedidos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getMisPedidos:", error);
    return [];
  }
}

export async function revocarPedido(pedidoId, token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    const response = await fetch(`${BASE_URL}/pedidos/${pedidoId}/revocar`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error al revocar pedido: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en revocarPedido:", error);
    throw error;
  }
}

export async function getPedidosAdmin(token) {
  try {
    const authToken = token || localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await fetch(`${BASE_URL}/pedidos/`, { headers });

    if (!response.ok) {
      throw new Error(`Error al obtener pedidos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getPedidosAdmin:", error);
    return [];
  }
}

export default api;