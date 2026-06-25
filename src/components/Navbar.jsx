import { Link } from 'react-router-dom';
import logo from '../assets/logo-amaram.png';

const Navbar = ({ estaLogueado, cerrarSesion, precioTotal, onCarritoClick }) => {
  // 🛡️ OWASP A10:2025 / Robustez del Cliente: Parseo Seguro de Sesión en Bloque Controlado
  // Evita que un string corrupto inyectado en la sesión local rompa o cuelgue la UI en React
  let usuario = null;
  try {
    const usuarioGuardado = sessionStorage.getItem('usuario');
    usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  } catch (error) {
    console.error("🚨 [UI AUTH ERROR] Error al procesar metadatos de sesión:", error.message);
    usuario = null;
  }

  // 🛡️ OWASP A01:2025 - Validación perimetral en la interfaz para renderizado de componentes
  const esCliente = usuario?.rol === 'CLIENTE';

  // Lógica original optimizada contra nulos para extraer Primer Nombre y Primer Apellido
  const primerNombre = usuario?.nombre ? usuario.nombre.trim().split(' ')[0] : 'Cliente';
  const primerApellido = usuario?.apellido ? usuario.apellido.trim().split(' ')[0] : '';
  const saludoCorto = primerApellido ? `${primerNombre} ${primerApellido}` : primerNombre;

  return (
    <header style={{ backgroundColor: 'white', borderBottom: '1px solid #eee', marginBottom: '30px' }}>
      {/* Nivel Superior: Logo, Buscador y Carrito */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="Logo Amaram" style={{ height: '50px', width: '50px', borderRadius: '50%', objectFit: 'cover' }} />
          <Link to="/" style={{ color: '#333', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Tienda AMARAM
          </Link>
        </div>
        
        <input 
          type="text" 
          placeholder="🔍 ¿Qué buscas hoy?" 
          style={{ padding: '12px 25px', borderRadius: '30px', border: '2px solid #E85D75', width: '400px', outline: 'none' }} 
        />
        
        {/* Activación del Sidebar del Carrito de Compras */}
        <div 
          onClick={onCarritoClick} 
          style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333', cursor: 'pointer', userSelect: 'none' }}
        >
          S/ {precioTotal ? precioTotal.toFixed(2) : "0.00"} 🛒
        </div>
      </div>

      {/* Nivel Inferior: Franja de Navegación */}
      <nav style={{ backgroundColor: '#E85D75', padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Inicio</Link>
          <Link to="/nosotros" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Nosotros</Link>
          <Link to="/catalogo" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Catálogo</Link>
          
          {/* 🛡️ OWASP A01:2025 - Control de Vistas Condicional por Perfil */}
          {estaLogueado && esCliente && (
            <Link to="/dashboard-cliente" style={{ color: '#fff0f2', textDecoration: 'none', fontWeight: 'bold', borderLeft: '1px solid #ffb3bf', paddingLeft: '20px' }}>
              🛍️ Mis Pedidos
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {estaLogueado ? (
            <>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                👤 ¡Hola, {saludoCorto}!
              </span>
              <button 
                onClick={cerrarSesion} 
                style={{ 
                  padding: '8px 15px', 
                  backgroundColor: '#111827', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>⚙️ Iniciar Sesión</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;