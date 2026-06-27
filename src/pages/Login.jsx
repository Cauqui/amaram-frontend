import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 🌟 IMPORTANTE: Recibimos el "onLoginSuccess" que viene desde tu App.jsx
function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const navigate = useNavigate();

  const mostrarMensaje = (mensaje, tipo = 'success') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: '', tipo: '' });
    }, 2500);
  };

  const iniciarSesion = async (e) => {
    e.preventDefault(); 
    try {
      const respuesta = await axios.post('hhttps://amaram-backend.onrender.com/api/login', { 
        email: email, 
        password: password 
      });
      
      const { token, usuario } = respuesta.data;
      
      if (token && usuario) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('rol', usuario.rol); 
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
        sessionStorage.setItem('nombre', usuario.nombre);

        // 🌟 Avisamos al estado
        if (onLoginSuccess) onLoginSuccess();

        mostrarMensaje(`¡Bienvenido de vuelta, ${usuario.nombre}! ✨`, 'success');

        // 🚀 SOLUCIÓN: Cambiamos navigate por redirección nativa con recarga automática
        setTimeout(() => {
          if (usuario.rol === 'ADMINISTRADOR' || usuario.rol === 'PERSONAL') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/'; // Recarga e ingresa limpio a la tienda
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Error en login:", error);
      mostrarMensaje("Credenciales incorrectas. Verifica tu acceso. ❌", 'error');
    }
  }

  const togglePassword = () => setMostrarPassword(!mostrarPassword);

  return (
    <div style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Mensaje Premium (Toast Flotante) */}
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

      {/* Formulario Estilizado */}
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#E85D75', textAlign: 'center', marginBottom: '30px' }}>Acceso al Sistema</h2>
        
        <form onSubmit={iniciarSesion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Correo Electrónico:</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="correo@amaram.com" 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', color: '#444' }}>Contraseña:</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={mostrarPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
              />
              <button 
                type="button" 
                onClick={togglePassword}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px', backgroundColor: '#E85D75', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            INGRESAR
          </button>
        </form>

        {/* 🌟 NUEVA SECCIÓN DE ENLACES DE REGISTRO Y RECUPERACIÓN */}
        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Link 
            to="/recuperar-password" 
            style={{ color: '#777', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.target.style.color = '#E85D75'}
            onMouseOut={(e) => e.target.style.color = '#777'}
          >
            ¿Olvidaste tu contraseña?
          </Link>
          
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', fontSize: '14px', color: '#444' }}>
            ¿Aún no tienes una cuenta?{' '}
            <Link 
              to="/registro" 
              style={{ color: '#E85D75', textDecoration: 'none', fontWeight: 'bold', transition: 'text-decoration 0.2s' }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Regístrate aquí
            </Link>
          </div>
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

export default Login;