import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import CarritoDrawer from "./components/CarritoDrawer";
import Footer from "./components/Footer";

import Login from "./views/Login";
import Register from "./views/Register";
import AdminDashboard from "./views/AdminDashboard";
import MisPedidos from "./views/MisPedidos";
import MisDatos from "./views/MisDatos";
import Arrepentimiento from "./views/Arrepentimiento";

import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { ToastProvider } from "./context/ToastContext";

function HomeView() {
  return (
    <main>
      <Hero />
      <Catalog />
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CarritoProvider>
            <div style={styles.appWrapper}>
              <Navbar />

              <div style={styles.mainContent}>
                <Routes>
                  {/* Inicio con Hero y Catálogo */}
                  <Route path="/" element={<HomeView />} />

                  {/* Autenticación */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Panel de Administrador (con control de acceso por rol) */}
                  <Route path="/admin" element={<AdminDashboard />} />

                  {/* Vistas de Cliente */}
                  <Route path="/mis-pedidos" element={<MisPedidos />} />
                  <Route path="/mis-datos" element={<MisDatos />} />

                  {/* Marco legal / Derecho de revocación */}
                  <Route path="/arrepentimiento" element={<Arrepentimiento />} />

                  {/* Fallback */}
                  <Route path="*" element={<HomeView />} />
                </Routes>
              </div>

              {/* Panel deslizante lateral del Carrito */}
              <CarritoDrawer />

              {/* Pie de página profesional */}
              <Footer />
            </div>
          </CarritoProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

const styles = {
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--bg-dark)",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};