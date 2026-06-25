import { useState, useEffect } from 'react';
import Productos from './Productos'; 
import Usuarios from './Usuarios';
import Clientes from './Clientes'; 
import HistorialVentas from './HistorialVentas'; 
// 🛡️ OWASP A09:2025 - Importamos el componente de la Bitácora Forense
import Auditoria from './Auditoria';

function Dashboard() {
  const [vistaActual, setVistaActual] = useState('resumen');
  const [usuario, setUsuario] = useState({ nombre: '', rol: '' });

  useEffect(() => {
    setUsuario({
      nombre: sessionStorage.getItem('nombre') || 'Usuario',
      rol: sessionStorage.getItem('rol') || 'Sin rol' // 🌟 Corregido de 'role' a 'rol' para coincidir con la UI
    });
  }, []);

  const cerrarSesion = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const estiloItemMenu = (vista) => ({
    padding: '15px 20px', cursor: 'pointer',
    backgroundColor: vistaActual === vista ? '#E85D75' : 'transparent',
    color: 'white', borderRadius: '8px', marginBottom: '5px',
    fontWeight: vistaActual === vista ? 'bold' : 'normal',
    transition: 'background-color 0.3s'
  });

  return (
    // CONTENEDOR PADRE: Ocupa exactamente el 100% de la altura de la pantalla (100vh)
    <div style={{ display: 'flex', height: '100vh', width: '100%', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      {/* SIDEBAR FIJO */}
      <div style={{ width: '250px', backgroundColor: '#2C3338', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #4a545c' }}>
          <h3 style={{ color: 'white', margin: 0 }}>Panel Admin</h3>
        </div>

        <ul style={{ listStyle: 'none', padding: '20px', margin: 0 }}>
          <li style={estiloItemMenu('resumen')} onClick={() => setVistaActual('resumen')}>📊 Dashboard</li>
          <li style={estiloItemMenu('productos')} onClick={() => setVistaActual('productos')}>🏷️ Productos</li>
          <li style={estiloItemMenu('usuarios')} onClick={() => setVistaActual('usuarios')}>👥 Usuarios</li>
          <li style={estiloItemMenu('clientes')} onClick={() => setVistaActual('clientes')}>👤 Clientes</li>
          <li style={estiloItemMenu('ventas')} onClick={() => setVistaActual('ventas')}>🛒 Historial Ventas</li>
          
          {/* 🛡️ OWASP A01:2025 - Renderizado Condicional Perimetral: El Personal Operativo NO ve este botón */}
          {usuario.rol === 'ADMINISTRADOR' && (
            <li style={estiloItemMenu('auditoria')} onClick={() => setVistaActual('auditoria')}>📋 Auditoría</li>
          )}
        </ul>

        {/* PERFIL */}
        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid #4a545c', backgroundColor: '#262d31' }}>
          <p style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>{usuario.nombre}</p>
          <p style={{ color: '#E85D75', fontSize: '0.8rem', margin: '5px 0 15px 0', textTransform: 'uppercase' }}>{usuario.rol}</p>
          <button 
            onClick={cerrarSesion}
            style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: Único contenedor con scroll activo */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '40px', overflowY: 'auto' }}>
        
        {vistaActual === 'resumen' && <div><h2 style={{ color: '#333', marginTop: 0 }}>Resumen del Sistema</h2></div>}
        {vistaActual === 'productos' && <Productos />}
        {vistaActual === 'usuarios' && <Usuarios />}
        {vistaActual === 'clientes' && <Clientes />}
        {vistaActual === 'ventas' && <HistorialVentas />}
        
        {/* 🛡️ OWASP A01:2025 - Inyección Segura del Componente Forense */}
        {vistaActual === 'auditoria' && usuario.rol === 'ADMINISTRADOR' && <Auditoria />}
        
      </div>
    </div>
  );
}

export default Dashboard;