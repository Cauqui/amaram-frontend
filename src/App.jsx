import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import DashboardCliente from './pages/DashboardCliente';
import Registro from './pages/Registro';
// 🛡️ OWASP A09:2025 - Importación de la página para la Bitácora Forense
import Auditoria from './pages/Auditoria';

// Layout de renderizado condicional perimetral
const Layout = ({ children, estaLogueado, cerrarSesion, precioTotal, onCarritoClick }) => {
  const location = useLocation();
  
  // Ocultamos el Navbar en las rutas de administración (/admin)
  const ocultarNavbar = location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      {!ocultarNavbar && (
        <Navbar 
          estaLogueado={estaLogueado} 
          cerrarSesion={cerrarSesion} 
          precioTotal={precioTotal} 
          onCarritoClick={onCarritoClick} 
        />
      )}
      <main style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

// 🔒 OWASP A01:2025 - Protector de Rutas e Interceptor de Privilegios para Administradores
const RutaAdmin = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('rol');
  const esAdmin = (rol === 'ADMINISTRADOR' || rol === 'PERSONAL');
  return (token && esAdmin) ? children : <Navigate to="/admin" replace />;
};

// 🔒 OWASP A01:2025 - Interceptor de Privilegios para Clientes (Segregación de Vistas)
const RutaCliente = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('rol');
  return (token && rol === 'CLIENTE') ? children : <Navigate to="/login" replace />;
};

function App() {
  const [carrito, setCarrito] = useState([]);
  const [estaLogueado, setEstaLogueado] = useState(!!sessionStorage.getItem('token'));
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // Escuchar cambios de sesión para actualizar la interfaz dinámicamente
  useEffect(() => {
    const revisarSesion = () => {
      setEstaLogueado(!!sessionStorage.getItem('token'));
    };
    window.addEventListener('storage', revisarSesion);
    return () => window.removeEventListener('storage', revisarSesion);
  }, []);

  // 🛡️ Mitigación de Errores Numéricos: Cálculo exacto y tipado forzado
  const precioTotal = carrito.reduce((suma, p) => {
    const unidadPrecio = parseFloat(p.precio_unitario) || 0;
    const cantidadProd = parseInt(p.cantidad, 10) || 1;
    return suma + (unidadPrecio * cantidadProd);
  }, 0);
  
  // 🛡️ OWASP A07:2025 - Destrucción Absoluta y Segura de Sesión en el Cliente
  const cerrarSesion = () => {
    sessionStorage.clear();
    localStorage.clear(); 
    
    setCarrito([]);
    setEstaLogueado(false);
    setCarritoAbierto(false);
    
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <Layout 
        estaLogueado={estaLogueado} 
        cerrarSesion={cerrarSesion} 
        precioTotal={precioTotal}
        onCarritoClick={() => setCarritoAbierto(true)} 
      >
        <Routes>
          {/* Rutas Públicas */}
          <Route 
            path="/" 
            element={
              <Inicio 
                carritoAbierto={carritoAbierto} 
                setCarritoAbierto={setCarritoAbierto} 
                productosEnCarrito={carrito} 
                setProductosEnCarrito={setCarrito} 
              />
            } 
          />
          
          <Route 
            path="/catalogo" 
            element={
              <Catalogo 
                carritoAbierto={carritoAbierto} 
                setCarritoAbierto={setCarritoAbierto} 
                productosEnCarrito={carrito} 
                setProductosEnCarrito={setCarrito} 
              />
            } 
          />
          
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* 🛍️ Ruta de Cliente Protegida */}
          <Route 
            path="/dashboard-cliente" 
            element={
              <RutaCliente>
                <DashboardCliente />
              </RutaCliente>
            } 
          />
          
          {/* ⚙️ Rutas de Administración Protegidas */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RutaAdmin>
                <Dashboard />
              </RutaAdmin>
            } 
          />

          {/* 🛡️ OWASP A01:2025 - Nueva Ruta Protegida de la Bitácora de Seguridad */}
          <Route 
            path="/admin/auditoria" 
            element={
              <RutaAdmin>
                <Auditoria />
              </RutaAdmin>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;