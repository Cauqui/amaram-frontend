import { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estaAutenticado, setEstaAutenticado] = useState(!!sessionStorage.getItem('token'));

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('http://localhost:3000/api/login', { email, password });
      
      const { token, usuario } = respuesta.data;
      const rol = usuario ? usuario.rol : null;
      const nombre = usuario ? usuario.nombre : 'Usuario';

      // Validación contra los valores reales de tu base de datos (ADMINISTRADOR y PERSONAL)
      if (token && (rol === 'ADMINISTRADOR' || rol === 'PERSONAL')) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('rol', rol);
        sessionStorage.setItem('nombre', nombre);
        setEstaAutenticado(true);
      } else {
        alert("Acceso denegado: El usuario no tiene permisos administrativos o de personal.");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error: Credenciales incorrectas o servidor no disponible.");
    }
  };

  if (estaAutenticado) {
    return <Dashboard />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#E85D75', textAlign: 'center', marginBottom: '30px' }}>Acceso al Sistema</h2>
        
        <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: '600', color: '#444' }}>Correo Electrónico:</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
              placeholder="correo@amaram.com" 
              style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
            />
          </div>
          
          <div>
            <label style={{ fontWeight: '600', color: '#444' }}>Contraseña:</label>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <input 
                type={mostrarPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
              />
              <button 
                type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#E85D75', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;