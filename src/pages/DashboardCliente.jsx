import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DashboardCliente() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState(null);

  // 🛡️ OWASP A10:2025 - Recuperación segura de metadatos de sesión (Previene quiebres de interfaz)
  let usuarioLogueado = null;
  try {
    const sesion = sessionStorage.getItem('usuario');
    usuarioLogueado = sesion ? JSON.parse(sesion) : null;
  } catch (err) {
    console.error("🚨 [DASHBOARD ERROR] Fallo al parsear sesión:", err.message);
  }

  useEffect(() => {
    const cargarHistorialCompras = async () => {
      try {
        const token = sessionStorage.getItem('token');
        
        // Consumimos el endpoint adaptativo blindado que creamos en el backend
        const respuesta = await axios.get('http://localhost:3000/api/ventas/historial', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPedidos(respuesta.data);
      } catch (err) {
        console.error("🚨 Error al recuperar el historial:", err.message);
        setErrorHistorial("No se pudo sincronizar el historial de compras con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarHistorialCompras();
  }, []);

  // Si no hay datos del usuario por una anomalía de sesión, redirige o muestra alerta limpia
  if (!usuarioLogueado) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        ⚠️ Error de autenticación: Por favor, vuelva a iniciar sesión de forma segura.
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 5px 0' }}>
          ¡Hola, {usuarioLogueado.nombre}! 👋
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Bienvenido a tu panel de control. Aquí puedes auditar el estado y tracking de tus compras recientes.
        </p>
      </div>

      {/* Contenedor Principal del Historial */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700' }}>
          📦 Mis Órdenes de Compra
        </h3>

        {errorHistorial && (
          <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '6px', color: '#ef4444', fontSize: '13px', marginBottom: '15px' }}>
            {errorHistorial}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
            ⏳ Sincronizando datos con el canal seguro de AMARAM...
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
            🍃 Aún no registras pedidos o transacciones comerciales en tu cuenta.
          </div>
        ) : (
          /* Tabla de Pedidos con Estilo Corporativo */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #edf2f7', color: '#64748b', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px 8px' }}>N° Pedido</th>
                  <th style={{ padding: '12px 8px' }}>Fecha</th>
                  <th style={{ padding: '12px 8px' }}>Método de Pago</th>
                  <th style={{ padding: '12px 8px' }}>ID Transacción</th>
                  <th style={{ padding: '12px 8px' }}>Estado</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold', color: '#e85d75' }}>#{pedido.id}</td>
                    <td style={{ padding: '14px 8px', color: '#475569' }}>
                      {new Date(pedido.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                        {pedido.metodo_pago}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>
                      {pedido.transaccion_id || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        padding: '4px 8px', 
                        borderRadius: '20px',
                        backgroundColor: pedido.estado === 'PAGADO' ? '#dcfce7' : '#fef9c3',
                        color: pedido.estado === 'PAGADO' ? '#15803d' : '#a16207'
                      }}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                      S/ {parseFloat(pedido.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCliente;