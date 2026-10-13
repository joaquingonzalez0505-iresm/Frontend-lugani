const BASE_URL = import.meta.env.VITE_API_URL || "https://backend-frontend-g6ps.onrender.com";

export const INITIAL_PRODUCTOS = [
  {
    id: 1,
    nombre: 'Teclado Inalámbrico',
    precio_final: 45000,
    cuotas_cantidad: 6,
    cuotas_valor: 7500,
    garantia_meses: 12,
    stock: 15,
  },
  {
    id: 2,
    nombre: 'Teclado Inalámbrico',
    precio_final: 45000,
    cuotas_cantidad: 6,
    cuotas_valor: 7500,
    garantia_meses: 12,
    stock: 15,
  },
];

export async function getProductos({ page = 0, limit = 12, nombre = "" } = {}) {
  try {
    const skip = page * limit;
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (nombre && nombre.trim() !== "") {
      params.append("nombre", nombre.trim());
    }

    const response = await fetch(`${BASE_URL}/productos/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Backend no alcanzable, retornando datos por defecto:", error);
    return INITIAL_PRODUCTOS;
  }
}

export async function crearProducto(prodPayload, token) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(`${BASE_URL}/productos/`, {
      method: "POST",
      headers,
      body: JSON.stringify(prodPayload),
    });

    if (!response.ok) {
      throw new Error(`Error al crear producto: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en crearProducto:", error);
    throw error;
  }
}

export async function actualizarProducto(id, prodPayload, token) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(prodPayload),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar producto: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en actualizarProducto:", error);
    throw error;
  }
}

export async function subirImagenProducto(file, token) {
  try {
    const formData = new FormData();
    formData.append("archivo", file);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
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

export async function loginUser(credentials, password) {
  try {
    const payload =
      typeof credentials === "object" && credentials !== null
        ? credentials
        : { email: credentials, password };

    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error en inicio de sesión: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Error en el registro: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

export async function getPerfil(token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${BASE_URL}/perfil`, {
      headers,
    });

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
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
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

export async function actualizarPerfil(userData, token) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(`${BASE_URL}/perfil`, {
      method: "PUT",
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar perfil: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en actualizarPerfil:", error);
    throw error;
  }
}

export async function exportarMisDatos(token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${BASE_URL}/usuarios/exportar`, {
      headers,
    });

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
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
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
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
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
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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