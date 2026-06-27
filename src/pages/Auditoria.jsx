import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [moduloFiltro, setModuloFiltro] = useState('TODOS'); // TODOS, USUARIOS, CATALOGO, SEGURIDAD
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarLogs = async () => {
      setCargando(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Llamada al endpoint seguro enviando el módulo seleccionado como query param
        const url = moduloFiltro === 'TODOS' 
          ? 'https://amaram-backend.onrender.com/api/auditoria' 
          : `'https://amaram-backend.onrender.com/api/auditoria?modulo=${moduloFiltro}`;

        const respuesta = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (respuesta.data && Array.isArray(respuesta.data)) {
          setLogs(respuesta.data);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error('🚨 Error al recuperar la bitácora:', err);
        setError(err.response?.data?.mensaje || 'Error al conectar con el servidor de seguridad.');
      } finally {
        setCargando(false);
      }
    };

    cargarLogs();
  }, [moduloFiltro]); // Cada vez que cambie el select, se vuelve a consultar al servidor

  // Filtrado reactivo local por texto (busca por nombre, email o detalle de la acción)
  const logsFiltrados = logs.filter(log => {
    const nombre = log.usuario_nombre ? log.usuario_nombre.toLowerCase() : '';
    const email = log.usuario_email ? log.usuario_email.toLowerCase() : '';
    const detalles = log.detalles ? log.detalles.toLowerCase() : '';
    const termino = busqueda.toLowerCase();

    return nombre.includes(termino) || email.includes(termino) || detalles.includes(termino);
  });

  // Función para formatear las marcas de tiempo de PostgreSQL
  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return '-';
    return new Date(fechaRaw).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  // Estilos dinámicos para los Badges de Severidad (OWASP Risk Level Indicator)
  const obtenerEstiloSeveridad = (sev) => {
    const base = {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };

    if (sev === 'ALTA') {
      return { ...base, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    } else if (sev === 'MEDIA') {
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
    }
    return { ...base, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Cabecera */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', color: '#1e293b', margin: '0 0 5px 0', fontWeight: '800' }}>
          📋 Bitácora Forense de Seguridad
        </h2>
        <p style={{ color: '#64748b', margin: '0', fontSize: '14px' }}>
          Trazabilidad total de operaciones críticas (OWASP A09:2025 - Registro y Monitoreo).
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '6px', marginBottom: '20px', color: '#991b1b', fontSize: '13px' }}>
          ⚠️ Alerta: {error}
        </div>
      )}

      {/* Barra de Herramientas Operativas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        
        {/* Buscador */}
        <input
          type="text"
          placeholder="🔍 Buscar por operador o palabra clave..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, maxWidth: '400px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
        />

        {/* Selector de Módulo */}
        <select
          value={moduloFiltro}
          onChange={(e) => setModuloFiltro(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
        >
          <option value="TODOS">🌐 Ver Todas las Acciones</option>
          <option value="USUARIOS">👥 Gestión de Usuarios y Clientes</option>
          <option value="CATALOGO">📦 Control de Catálogo e Inventario</option>
          <option value="SEGURIDAD">🔑 Seguridad y Accesos Críticos</option>
        </select>
      </div>

      {/* Tabla Corporativa */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                <th style={{ padding: '14px 16px' }}>ID Log</th>
                <th style={{ padding: '14px 16px' }}>Operador Responsable</th>
                <th style={{ padding: '14px 16px' }}>Acción</th>
                <th style={{ padding: '14px 16px' }}>Detalles de Impacto</th>
                <th style={{ padding: '14px 16px' }}>Severidad</th>
                <th style={{ padding: '14px 16px' }}>Dirección IP</th>
                <th style={{ padding: '14px 16px' }}>Fecha y Hora Servidor</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    ⏳ Recuperando eventos e hilos forenses...
                  </td>
                </tr>
              ) : logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    📭 No hay registros de auditoría bajo la categoría seleccionada.
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#64748b' }}>#{log.id}</td>
                    
                    {/* Operador */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{log.usuario_nombre}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{log.usuario_email} ({log.rol_operador})</div>
                    </td>

                    {/* Acción */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e40af', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                        {log.accion}
                      </span>
                    </td>

                    {/* Descripción de detalles */}
                    <td style={{ padding: '14px 16px', color: '#334155', maxWidth: '350px', lineHeight: '1.4' }}>
                      {log.detalles}
                    </td>

                    {/* Badge de Severidad */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={obtenerEstiloSeveridad(log.severidad)}>
                        ● {log.severidad}
                      </span>
                    </td>

                    {/* IP */}
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569' }}>
                      {log.direccion_ip}
                    </td>

                    {/* Fecha */}
                    <td style={{ padding: '14px 16px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {formatearFecha(log.fecha)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Auditoria;