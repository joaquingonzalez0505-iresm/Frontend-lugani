import React, {
  createContext,
  useContext,
  useState,
} from "react";

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? {
              ...item,
              cantidad: item.cantidad + 1,
            }
            : item
        );
      }

      return [
        ...prev,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nueva = item.cantidad + delta;

            return nueva > 0
              ? {
                ...item,
                cantidad: nueva,
              }
              : null;
          }

          return item;
        })
        .filter(Boolean)
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalItems = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const totalPrecio = carrito.reduce(
    (acc, item) =>
      acc +
      (Number(
        item.precio_final ?? item.precio ?? 0
      ) || 0) *
      item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        mostrarModal,
        setMostrarModal,
        agregarAlCarrito,
        eliminarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};