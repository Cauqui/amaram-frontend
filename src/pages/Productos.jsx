import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  // Estados para Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 15;

  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio_unitario: '', stock_disponible: '', categoria_id: 1, imagen_url: ''
  });
  const [archivo, setArchivo] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    const resProd = await axios.get('https://amaram-backend.onrender.com/api/productos');
    const resCat = await axios.get('https://amaram-backend.onrender.com/api/categorias');
    setProductos(resProd.data);
    setCategorias(resCat.data);
  };

  // Lógica de Paginación
  const indexOfLastProduct = paginaActual * productosPorPagina;
  const indexOfFirstProduct = indexOfLastProduct - productosPorPagina;
  const productosActuales = productos.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  const validarCampo = (name, value) => {
    let error = "";
    if (!value || value.toString().trim() === "") error = "Campo obligatorio.";
    else if (name === "nombre" && !/^[a-zA-Z0-9 ]+$/.test(value)) error = "Solo letras y números.";
    else if (name === "precio_unitario" && !/^\d+(\.\d{1,2})?$/.test(value)) error = "Formato: 12.00 (Máx 5 enteros, 2 decimales).";
    else if (name === "stock_disponible" && !/^\d{1,5}$/.test(value)) error = "Solo números (máx 5 dígitos).";
    else if (name === "descripcion" && !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,]+$/.test(value)) error = "Caracteres no permitidos (solo texto, puntos y comas).";
    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const abrirModal = (prod = null) => {
    setErrores({});
    if (prod) {
      setEditandoId(prod.id);
      // Asignamos explícitamente solo las propiedades necesarias para el formulario
      setForm({
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        precio_unitario: prod.precio_unitario || '',
        stock_disponible: prod.stock_disponible || '',
        categoria_id: prod.categoria_id || 1,
        imagen_url: prod.imagen_url || ''
      });
      setArchivo(null);
    } else {
      setEditandoId(null);
      setForm({ nombre: '', descripcion: '', precio_unitario: '', stock_disponible: '', categoria_id: 1, imagen_url: '' });
      setArchivo(null);
    }
    setMostrarModal(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const tieneImagen = archivo || form.imagen_url;
    if (Object.values(errores).some(err => err !== "") || !form.nombre || !form.precio_unitario || !tieneImagen) {
      Swal.fire({ icon: 'error', title: 'Formulario incompleto', text: 'Por favor, complete todos los campos obligatorios.', confirmButtonColor: '#E85D75' });
      return;
    }

    setCargando(true);
    const formData = new FormData();

    // 1️⃣ ORDEN ESTRICTO: Primero los textos planos requeridos para rellenar el req.body
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion || '');
    formData.append('precio_unitario', parseFloat(form.precio_unitario) || 0.00);
    formData.append('stock_disponible', parseInt(form.stock_disponible, 10) || 0);
    formData.append('categoria_id', parseInt(form.categoria_id, 10) || 1);
    formData.append('status', form.status || 'Publicado');

    // 2️⃣ LOS BINARIOS AL FINAL: Para que Multer procese el buffer tras mapear el cuerpo de la petición
    if (archivo) {
      formData.append('imagen', archivo);
    }
    if (editandoId && !archivo) {
      formData.append('imagen_url', form.imagen_url);
    }

    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      editandoId
        ? await axios.put(`https://amaram-backend.onrender.com/api/productos/${editandoId}`, formData, config)
        : await axios.post('https://amaram-backend.onrender.com/api/productos', formData, config);

      Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Guardado correctamente.', timer: 1500, showConfirmButton: false });
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error(error);
      const apiMensaje = error.response?.data?.mensaje || 'No se pudo guardar el producto correctamente.';
      Swal.fire({ icon: 'error', title: 'Error', text: apiMensaje });
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?', text: "Esta acción no se puede deshacer.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('token'); // 🔑 Traer token
        await axios.delete(`https://amaram-backend.onrender.com/api/productos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` } // 👈 Pasar token
        });
        Swal.fire('Eliminado', 'Producto borrado.', 'success');
        cargarDatos();
      } catch (error) { Swal.fire('Error', 'No se pudo eliminar.', 'error'); }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🏷️ Gestión de Productos</h2>
        <button onClick={() => abrirModal()} style={{ padding: '10px 20px', backgroundColor: '#E85D75', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Nuevo Producto</button>
      </div>

      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={guardarProducto} style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h3>

            {/* Inputs existentes */}
            <input maxLength="50" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} onBlur={e => validarCampo('nombre', e.target.value)} style={inputStyle} />
            {errores.nombre && <small style={{ color: 'red' }}>{errores.nombre}</small>}

            <input maxLength="8" placeholder="Precio (Ej: 12.00)" value={form.precio_unitario} onChange={e => setForm({ ...form, precio_unitario: e.target.value })} onBlur={e => validarCampo('precio_unitario', e.target.value)} style={inputStyle} />
            {errores.precio_unitario && <small style={{ color: 'red' }}>{errores.precio_unitario}</small>}

            <input maxLength="5" placeholder="Stock" value={form.stock_disponible} onChange={e => setForm({ ...form, stock_disponible: e.target.value })} onBlur={e => validarCampo('stock_disponible', e.target.value)} style={inputStyle} />
            {errores.stock_disponible && <small style={{ color: 'red' }}>{errores.stock_disponible}</small>}

            {/* --- AQUÍ ESTÁ EL SELECTOR CORREGIDO --- */}
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Categoría:</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm({ ...form, categoria_id: e.target.value })}
              style={inputStyle}
            >
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>

            <input type="file" onChange={(e) => setArchivo(e.target.files[0])} style={inputStyle} />

            <textarea maxLength="300" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} onBlur={e => validarCampo('descripcion', e.target.value)} style={inputStyle} />
            {errores.descripcion && <small style={{ color: 'red' }}>{errores.descripcion}</small>}

            {/* Botones */}
            <button type="submit" disabled={cargando} style={{ ...inputStyle, marginTop: '10px', backgroundColor: cargando ? '#ccc' : '#28a745', color: 'white', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer' }}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
          </form>
        </div>
      )}

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>SKU</th>
            <th style={{ padding: '12px' }}>Imagen</th>
            <th style={{ padding: '12px' }}>Nombre</th>
            <th style={{ padding: '12px' }}>Categoría</th>
            <th style={{ padding: '12px' }}>Precio</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosActuales.map((prod, index) => (
            <tr key={prod.id} style={{ borderBottom: '1px solid #ddd', verticalAlign: 'middle' }}>
              <td style={{ padding: '12px' }}>{(paginaActual - 1) * productosPorPagina + index + 1}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{prod.sku}</td>
              <td style={{ padding: '12px' }}><img src={prod.imagen_url} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
              <td style={{ padding: '12px' }}>{prod.nombre}</td>
              <td style={{ padding: '12px' }}>{prod.categoria_nombre}</td>
              <td style={{ padding: '12px' }}>S/ {prod.precio_unitario}</td>
              <td style={{ padding: '12px' }}>
                <button onClick={() => abrirModal(prod)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => eliminarProducto(prod.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BOTONES DE PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)} style={pagButtonStyle}>Anterior</button>
          {[...Array(totalPaginas)].map((_, i) => (
            <button key={i} onClick={() => setPaginaActual(i + 1)} style={{ ...pagButtonStyle, backgroundColor: paginaActual === i + 1 ? '#E85D75' : '#ddd', color: paginaActual === i + 1 ? 'white' : 'black' }}>{i + 1}</button>
          ))}
          <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)} style={pagButtonStyle}>Siguiente</button>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const pagButtonStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
export default Productos;