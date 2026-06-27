import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [activo, setActivo] = useState(true);
  const [errorPass, setErrorPass] = useState("");

  const [form, setForm] = useState({ 
    nombre: '', email: '', password: '', direccion: '', rol: 'PERSONAL', celular: '', activo: true 
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('https://amaram-backend.onrender.com/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    }
  };

  const validarPassword = (valor) => {
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const noSequencia = /(012|123|234|345|456|567|678|789)/;

    if (valor.length === 0) {
      setErrorPass("");
    } else if (!passRegex.test(valor) || noSequencia.test(valor)) {
      setErrorPass("❌ Insegura: Min 8 chars, Mayús, Minús, números, símbolos y sin secuencias.");
    } else {
      setErrorPass("✅ Contraseña segura");
    }
  };

  const abrirModal = (usuario = null) => {
    setErrorPass("");
    if (usuario) {
      setEditandoId(usuario.id);
      setActivo(usuario.activo);
      setForm({ ...usuario, password: '' });
    } else {
      setEditandoId(null);
      setActivo(true);
      setForm({ nombre: '', email: '', password: '', direccion: '', rol: 'PERSONAL', celular: '', activo: true });
    }
    setMostrarModal(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const dataToSend = editandoId ? { ...form, activo } : form;
      
      if (editandoId) {
        await axios.put(`https://amaram-backend.onrender.com/api/usuarios/${editandoId}`, dataToSend, config);
        Swal.fire('¡Editado!', 'Usuario actualizado con éxito', 'success');
      } else {
        await axios.post('https://amaram-backend.onrender.com/api/usuarios', dataToSend, config);
        Swal.fire('¡Guardado!', 'Usuario creado con éxito', 'success');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (err) {
      Swal.fire('Error', 'Hubo un problema al guardar', 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E85D75',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(`https://amaram-backend.onrender.com/api/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        cargarDatos();
        Swal.fire('Eliminado', 'Usuario borrado con éxito', 'success');
      } catch (err) { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>👤 Gestión de Usuarios</h2>
        <button onClick={() => abrirModal()} style={btnNuevoStyle}>+ Nuevo Usuario</button>
      </div>

      {mostrarModal && (
        <div style={modalOverlayStyle}>
          <form onSubmit={guardarUsuario} style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>{editandoId ? '📝 Editar Usuario' : '➕ Nuevo Usuario'}</h3>
            <div style={gridFormStyle}>
              <input placeholder="Nombre Completo" maxLength="40" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={inputStyle} required />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} required />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <input placeholder="Contraseña (Mín. 8 caracteres)" type="password" value={form.password} onChange={(e) => { setForm({...form, password: e.target.value}); validarPassword(e.target.value); }} style={{ ...inputStyle, borderColor: errorPass.startsWith('❌') ? 'red' : '#ddd' }} required={!editandoId} />
                {errorPass && <span style={{ fontSize: '11px', color: errorPass.startsWith('✅') ? 'green' : 'red' }}>{errorPass}</span>}
              </div>

              <input placeholder="Celular" maxLength="9" value={form.celular} onChange={e => setForm({...form, celular: e.target.value.replace(/\D/g, '')})} style={inputStyle} />
              <input placeholder="Dirección" maxLength="50" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} style={inputStyle} />
              <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} style={inputStyle}>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="PERSONAL">PERSONAL</option>
              </select>
            </div>
            
            {editandoId && (
              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label>Estado:</label>
                <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
                <span>{activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={cargando || (errorPass.startsWith('❌'))} style={{ ...btnGuardarStyle, opacity: (cargando || errorPass.startsWith('❌')) ? 0.6 : 1 }}>{cargando ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setMostrarModal(false)} style={btnCancelarStyle}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={tableStyle}>
          <thead>
            {/* CORRECCIÓN: Agregué la cabecera 'ID' para que coincida con las celdas de abajo */}
            <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Celular</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, index) => (
              <tr key={u.id} style={trStyle}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}><strong>{u.nombre}</strong></td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}><span style={badgeStyle(u.rol)}>{u.rol}</span></td>
                <td style={tdStyle}>{u.celular || '---'}</td>
                <td style={tdStyle}>{u.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                <td style={tdStyle}>
                  <button onClick={() => abrirModal(u)} style={btnEditStyle}>Editar</button>
                  <button onClick={() => eliminarUsuario(u.id)} style={btnDelStyle}>Borrar</button>
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
const gridFormStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
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
const badgeStyle = (rol) => ({ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: rol === 'ADMINISTRADOR' ? '#D1ECF1' : '#E2E3E5', color: rol === 'ADMINISTRADOR' ? '#0C5460' : '#383D41' });

export default Usuarios;