import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Inicio({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    axios.get('https://amaram-backend.onrender.com/api/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error("Error al cargar productos:", err));
  }, []);

  useEffect(() => {
    if (productos.length <= 3) return;
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 3 >= productos.length ? 0 : prev + 3));
    }, 30000);
    return () => clearInterval(intervalo);
  }, [productos]);

  const productosVisibles = productos.slice(indice, indice + 3);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Banner Principal */}
      <section style={{ 
        background: 'linear-gradient(135deg, #fff5f6 0%, #fffbf0 100%)', 
        padding: '60px 40px',
        borderRadius: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #fee2e2'
      }}>
        <div style={{ maxWidth: '50%' }}>
          <h1 style={{ fontSize: '3rem', color: '#1f2937', margin: '0 0 16px 0' }}>Tienda AMARAM</h1>
          <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '24px' }}>Diseños exclusivos. Calidad en cada abrazo.</p>
          <button style={{ padding: '14px 32px', backgroundColor: '#E85D75', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Explorar ahora
          </button>
        </div>
        <div style={{ width: '320px', height: '220px', backgroundColor: '#e5e7eb', borderRadius: '24px' }}></div>
      </section>

      {/* Productos Destacados (Carrusel estático de 3 productos) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {productosVisibles.map(p => (
          <div key={p.id} style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '24px', 
            textAlign: 'center', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #f3f4f6'
          }}>
             <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '180px', objectFit: 'contain', marginBottom: '16px' }} />
             <h3 style={{ fontSize: '1.25rem', color: '#111827', margin: '0 0 8px 0' }}>{p.nombre}</h3>
             <p style={{ color: '#E85D75', fontWeight: '700', fontSize: '1.4rem', margin: '0 0 20px 0' }}>S/ {p.precio_unitario}</p>
             
             {/* Botón negro con la forma correcta */}
             <button 
              onClick={() => agregarAlCarrito(p)}
              style={{ 
                width: '100%',
                padding: '12px', 
                backgroundColor: '#111827', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Inicio;