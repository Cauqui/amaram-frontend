import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState(''); // 🚀 Nuevo estado para el apellido
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
  
  // Estados para Errores en tiempo real
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const mostrarMensaje = (mensaje, tipo = 'success') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: '', tipo: '' });
    }, 2500);
  };

  // 📝 VALIDACIÓN EN TIEMPO REAL
  const validarCampo = (nombreCampo, valor) => {
    let unError = '';
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (nombreCampo === 'nombre') {
      if (valor.length > 0 && !soloLetras.test(valor)) {
        unError = 'El nombre solo debe contener letras.';
      } else if (valor.length > 0 && valor.length < 3) { // Ajustado a 3 por ser primer nombre
        unError = 'El nombre debe tener mínimo 3 caracteres.';
      }
    }

    if (nombreCampo === 'apellido') { // 🚀 Validación para el apellido
      if (valor.length > 0 && !soloLetras.test(valor)) {
        unError = 'El apellido solo debe contener letras.';
      } else if (valor.length > 0 && valor.length < 3) {
        unError = 'El apellido debe tener mínimo 3 caracteres.';
      }
    }

    if (nombreCampo === 'telefono') {
      if (valor.length > 0 && valor.length !== 9) {
        unError = 'El número de celular debe contener exactamente 9 dígitos.';
      }
    }

    if (nombreCampo === 'email') {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (valor.length > 0 && !regexEmail.test(valor)) {
        unError = 'Introduce un correo electrónico válido (ejemplo@dominio.com).';
      }
    }

    if (nombreCampo === 'password') {
      if (valor.length > 0) {
        const minChars = valor.length >= 8;
        const tieneMayus = /[A-Z]/.test(valor);
        const tieneMinus = /[a-z]/.test(valor);
        const tieneNum = /[0-9]/.test(valor);
        const tieneSimbolo = /[^A-Za-z0-9]/.test(valor);
        
        // Evitar secuencias obvias
        const secuencias = ['123', 'abc', 'qwe', 'asd', '1234', 'abcd'];
        const tieneSecuencia = secuencias.some(seq => valor.toLowerCase().includes(seq));

        if (!minChars) unError = 'Mínimo 8 caracteres.';
        else if (!tieneMayus) unError = 'Debe incluir al menos una mayúscula.';
        else if (!tieneMinus) unError = 'Debe incluir al menos una minúscula.';
        else if (!tieneNum) unError = 'Debe incluir al menos un número.';
        else if (!tieneSimbolo) unError = 'Debe incluir al menos un símbolo (ej. @,#,$,_).';
        else if (tieneSecuencia) unError = 'No se permiten secuencias de teclado simples (ej. 123).';
      }
    }

    setErrores(prev => ({ ...prev, [nombreCampo]: unError }));
  };

  // Controlar cambios en el celular para restringir letras y longitud de inmediato
  const manejarCambioCelular = (e) => {
    const valor = e.target.value.replace(/\D/g, ''); // Remueve cualquier cosa que NO sea número al instante
    if (valor.length <= 9) { 
      setTelefono(valor);
      validarCampo('telefono', valor);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar (incluido el apellido)
    if (!nombre || !apellido || !telefono || !email || !password) {
      mostrarMensaje("Por favor, completa todos los campos requeridos. ⚠️", 'error');
      return;
    }

    // Verificar si queda algún mensaje de error activo
    if (errores.nombre || errores.apellido || errores.telefono || errores.email || errores.password) {
      mostrarMensaje("Por favor, corrige los errores del formulario. ⚠️", 'error');
      return;
    }

    try {
      // 🚀 Ahora sí enviamos datos reales e íntegros a tu base de datos
      await axios.post('https://amaram-backend.onrender.com/api/clientes/registro', {
        nombre,
        apellido,   // 🌟 Apellido real guardado correctamente
        email,
        password,
        direccion: '',  // Se puede mandar vacío ya que en tu BD acepta nulos (is_nullable = YES)
        celular: telefono 
      });

      mostrarMensaje("¡Cuenta creada con éxito! Redirigiendo... 🎉", 'success');
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      console.error("Error en registro:", error);
      const msgError = error.response?.data?.error || error.response?.data?.mensaje || "Error al registrar la cuenta. ❌";
      mostrarMensaje(msgError, 'error');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 0' }}>
      
      {/* Mensaje Flotante */}
      {notificacion.mostrar && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '30px',
          backgroundColor: notificacion.tipo === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '16px 28px',
          borderRadius: '12px',
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
          fontSize: '15px'
        }}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Tarjeta de Registro */}
      <div style={{ maxWidth: '420px', width: '100%', padding: '40px 30px', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#E85D75', textAlign: 'center', marginBottom: '30px' }}>Crear Cuenta</h2>
        
        <form onSubmit={manejarRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Campo: Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Nombre:</label>
            <input 
              type="text" 
              required 
              value={nombre} 
              onChange={(e) => { setNombre(e.target.value); validarCampo('nombre', e.target.value); }} 
              placeholder="Ej. Ana" 
              style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${errores.nombre ? '#ef4444' : '#ccc'}`, outline: 'none' }} 
            />
            {errores.nombre && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>{errores.nombre}</span>}
          </div>

          {/* Campo: Apellido 🚀 NUEVO INPUT EN LA INTERFAZ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Apellido:</label>
            <input 
              type="text" 
              required 
              value={apellido} 
              onChange={(e) => { setApellido(e.target.value); validarCampo('apellido', e.target.value); }} 
              placeholder="Ej. Díaz" 
              style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${errores.apellido ? '#ef4444' : '#ccc'}`, outline: 'none' }} 
            />
            {errores.apellido && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>{errores.apellido}</span>}
          </div>

          {/* Campo: Celular */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Celular:</label>
            <input 
              type="text" 
              required 
              value={telefono} 
              onChange={manejarCambioCelular} 
              placeholder="Ej. 999999999" 
              style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${errores.telefono ? '#ef4444' : '#ccc'}`, outline: 'none' }} 
            />
            {errores.telefono && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>{errores.telefono}</span>}
          </div>

          {/* Campo: Correo Electrónico */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Correo Electrónico:</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => { setEmail(e.target.value); validarCampo('email', e.target.value); }} 
              placeholder="correo@amaram.com" 
              style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${errores.email ? '#ef4444' : '#ccc'}`, outline: 'none' }} 
            />
            {errores.email && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>{errores.email}</span>}
          </div>
          
          {/* Campo: Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Contraseña:</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={mostrarPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); validarCampo('password', e.target.value); }} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '8px', border: `1px solid ${errores.password ? '#ef4444' : '#ccc'}`, boxSizing: 'border-box', outline: 'none' }} 
              />
              <button 
                type="button" 
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errores.password && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>{errores.password}</span>}
          </div>
          
          {/* Botón Registrarse */}
          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px', backgroundColor: '#E85D75', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
          >
            REGISTRARME
          </button>
        </form>

        {/* Enlace de Retorno */}
        <div style={{ borderTop: '1px solid #eee', marginTop: '24px', paddingTop: '16px', textAlign: 'center', fontSize: '14px', color: '#444' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link 
            to="/login" 
            style={{ color: '#E85D75', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Inicia sesión aquí
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Registro;