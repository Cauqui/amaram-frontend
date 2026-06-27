import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Si usas axios directamente, asegúrate de que diga 'axios'

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Consumo directo al canal seguro adaptativo de AMARAM
        const respuesta = await axios.get('https://amaram-backend.onrender.com/api/ventas/historial', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (respuesta.data && Array.isArray(respuesta.data)) {
          setVentas(respuesta.data);
        } else {
          setVentas([]);
        }
      } catch (err) {
        console.error('🚨 Error al solicitar historial administrativo:', err);
        setError(err.response?.data?.mensaje || err.message || 'Error al conectar con el servidor');
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorial();
  }, []);

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return '-';
    try {
      return new Date(fechaRaw).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const formatearMoneda = (monto) => `S/ ${parseFloat(monto || 0).toFixed(2)}`;

  // 🛡️ Sanitización Visual de Identificadores Criptográficos o de Simulación
  const formatearReferencia = (idTransaccion) => {
    if (!idTransaccion) return '-';
    // Remueve dinámicamente cualquier tipo de prefijo simulado para limpieza estética de la auditoría
    return idTransaccion
      .replace('chr_sim_qr_', '')
      .replace('chr_sim_yape_', '')
      .replace('chr_sim_tarjeta_', '');
  };

  // Filtrado expansivo multi-parámetro (Evita excepciones de ruptura si los campos vienen nulos)
  const ventasFiltradas = Array.isArray(ventas) 
    ? ventas.filter(v => {
        const nombre = v?.cliente_nombre ? String(v.cliente_nombre).toLowerCase() : '';
        const apellido = v?.cliente_apellido ? String(v.cliente_apellido).toLowerCase() : '';
        const email = v?.cliente_email ? String(v.cliente_email).toLowerCase() : '';
        const termino = busqueda.toLowerCase();
        
        return nombre.includes(termino) || apellido.includes(termino) || email.includes(termino);
      })
    : [];

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Encabezado fijo */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', color: '#1e293b', margin: '0 0 5px 0', fontWeight: '800' }}>
          📊 Auditoría e Historial de Ventas
        </h2>
        <p style={{ color: '#64748b', margin: '0', fontSize: '14px' }}>
          Panel forense de conciliación comercial y seguimiento transaccional de AMARAM.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '6px', marginBottom: '20px', color: '#991b1b', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Buscador Perimetral */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, apellido o correo del comprador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', maxWidth: '460px', padding: '11px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
        />
      </div>

      {/* Estructura de Tabla Corporativa */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                <th style={{ padding: '14px 16px' }}>N° Venta</th>
                <th style={{ padding: '14px 16px' }}>Cliente Comprador</th>
                <th style={{ padding: '14px 16px' }}>Fecha y Hora</th>
                <th style={{ padding: '14px 16px' }}>Método</th>
                <th style={{ padding: '14px 16px' }}>Estado</th>
                <th style={{ padding: '14px 16px' }}>ID Transacción / Pasarela</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    ⏳ Sincronizando registros transaccionales con el core de PostgreSQL...
                  </td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    📭 No se registran operaciones comerciales bajo los parámetros ingresados.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v, idx) => {
                  const nombreCompleto = v.cliente_nombre 
                    ? `${v.cliente_nombre} ${v.cliente_apellido || ''}`.trim() 
                    : 'Cliente General';

                  return (
                    <tr key={v.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#e85d75' }}>#{v.id}</td>
                      
                      {/* Columna Doble: Nombre + Email */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{nombreCompleto}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{v.cliente_email || '-'}</div>
                      </td>
                      
                      <td style={{ padding: '14px 16px', color: '#334155' }}>{formatearFecha(v.fecha)}</td>
                      
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: (v.metodo_pago === 'QR' || v.metodo_pago === 'YAPE') ? '#fdf2f8' : '#eff6ff',
                          color: (v.metodo_pago === 'QR' || v.metodo_pago === 'YAPE') ? '#9d174d' : '#1e40af'
                        }}>
                          {(v.metodo_pago === 'QR' || v.metodo_pago === 'YAPE') ? '🔮 YAPE / QR' : '💳 TARJETA'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0'
                        }}>
                          ● {v.estado || 'PAGADO'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569', fontSize: '13px' }}>
                        {formatearReferencia(v.transaccion_id)}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '700', textAlign: 'right', fontSize: '15px' }}>
                        {formatearMoneda(v.total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialVentas;