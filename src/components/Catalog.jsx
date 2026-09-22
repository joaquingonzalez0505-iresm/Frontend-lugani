// src/components/Catalog.jsx
import React, { useState, useEffect } from "react";
import { getProductos } from "../services/api";

export default function Catalog() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getProductos({ page, limit: 5, nombre: busqueda });
        setProductos(data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    cargarProductos();
  }, [page, busqueda]);

  const handleBusquedaChange = (e) => {
    setPage(0);
    setBusqueda(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Catálogo de Productos</h2>

      {/* Buscador */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={busqueda}
          onChange={handleBusquedaChange}
          style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
        />
      </div>

      {/* Tarjetas de Productos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "15px",
          margin: "20px 0"
        }}
      >
        {productos.length > 0 ? (
          productos.map((prod) => (
            <div
              key={prod.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>{prod.nombre || prod.name}</h3>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                Precio: ${prod.precio || prod.price}
              </p>
            </div>
          ))
        ) : (
          <p>No se encontraron productos.</p>
        )}
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 0}
        >
          Anterior
        </button>

        <span>Página {page + 1}</span>

        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={productos.length < 5}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}