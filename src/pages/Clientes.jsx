import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', celular: '', direccion: '', password: ''
  });

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('https://amaram-backend.onrender.com/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(res.data);
    } catch (err) { 
      Swal.fire('Error', 'No se pudieron cargar los clientes', 'error'); 
    }
  };

  const abrirModal = (cliente = null) => {
    setEditando(cliente);
    setForm(cliente || { nombre: '', apellido: '', email: '', celular: '', direccion: '', activo: true });
    setMostrarModal(true);
  };

  const validarPassword = (pass) => {
    if (!pass) return false;
    const tieneMayus = /[A-Z]/.test(pass);
    const tieneMinus = /[a-z]/.test(pass);
    const tieneNum = /[0-9]/.test(pass);
    const tieneSimbolo = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const longitudOk = pass.length >= 6;

    return tieneMayus && tieneMinus && tieneNum && tieneSimbolo && longitudOk;
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    if (!editando && !validarPassword(form.password)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La contraseña no es segura: debe tener min 6 chars, Mayús, Minús, números y símbolos.',
          backdrop: true,
          heightAuto: false, 
          willOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999';
          }
        });
        return;
    }

    setCargando(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editando) {
        await axios.put(`https://amaram-backend.onrender.com/api/clientes/${editando.uuid}`, form, config);
        Swal.fire('¡Éxito!', 'Cliente actualizado correctamente', 'success');
      } else {
        await axios.post('https://amaram-backend.onrender.com/api/clientes/registro', form, config);
        Swal.fire('¡Éxito!', 'Cliente registrado correctamente', 'success');
      }

      setMostrarModal(false);
      cargarClientes();
    } catch (err) {
      Swal.fire('Error', 'Error al guardar el cliente. Verifica el correo.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (uuid) => {
    const res = await Swal.fire({ 
      title: '¿Estás seguro?', 
      text: "Esta acción no se puede deshacer",
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#E85D75',
      confirmButtonText: 'Sí, eliminar' 
    });

    if (res.isConfirmed) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(`https://amaram-backend.onrender.com/api/clientes/${uuid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        cargarClientes();
        Swal.fire('Eliminado', 'Cliente borrado con éxito', 'success');
      } catch (err) { 
        Swal.fire('Error', 'No se pudo eliminar', 'error'); 
      }
    }
  };

  const gridFormStyle = { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '15px', 
    marginTop: '15px' 
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>👥 Gestión de Clientes</h2>
        <button onClick={() => abrirModal()} style={btnNuevoStyle}>+ Nuevo Cliente</button>
      </div>

      {mostrarModal && (
        <div style={modalOverlayStyle}>
          <form onSubmit={guardarCliente} style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>{editando ? '📝 Editar Cliente' : '➕ Nuevo Cliente'}</h3>
            <div style={gridFormStyle}>
              <input placeholder="Nombre" maxLength="20" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} style={inputStyle} required />
              <input placeholder="Apellido" maxLength="20" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} style={inputStyle} required />
              <input placeholder={editando ? "Nueva contraseña (opcional)" : "Contraseña"} type="password" value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} style={inputStyle} required={!editando} />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} required />
              <input placeholder="Celular" maxLength="9" value={form.celular} onChange={e => setForm({...form, celular: e.target.value.replace(/\D/g, '')})} style={inputStyle} />
              <input placeholder="Dirección" maxLength="50" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={cargando} style={btnGuardarStyle}>{cargando ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setMostrarModal(false)} style={btnCancelarStyle}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombres y Apellidos</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Celular</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c, index) => (
              <tr key={c.uuid} style={trStyle}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{c.nombre} {c.apellido}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.celular || '---'}</td>
                <td style={tdStyle}>
                  <button onClick={() => abrirModal(c)} style={btnEditStyle}>Editar</button>
                  <button onClick={() => eliminarCliente(c.uuid)} style={btnDelStyle}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { padding: '15px', color: '#666', fontWeight: 'bold', fontSize: '14px' };
const tdStyle = { padding: '15px', fontSize: '14px', borderBottom: '1px solid #eee' };
const trStyle = { transition: 'background 0.2s' };
const btnNuevoStyle = { padding: '10px 20px', backgroundColor: '#E85D75', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnGuardarStyle = { flex: 1, padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelarStyle = { flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const btnEditStyle = { marginRight: '10px', padding: '5px 12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnDelStyle = { padding: '5px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Clientes;