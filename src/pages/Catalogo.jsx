import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * 🌟 Componente interno: Formulario de Checkout Real con Culqi (Tarjeta y Yape)
 */
const CheckoutForm = ({ total, productos, alConfirmarExito, alCancelar }) => {
  const [metodoPago, setMetodoPago] = useState('TARJETA'); // 'TARJETA' o 'YAPE'
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState(null);

  // Estados para el Formulario de Tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados para el Formulario de Yape
  const [codigoReferencia, setCodigoReferencia] = useState('');

  // Formateadores automáticos de escritura
  const manejarNumeroTarjeta = (e) => {
    const valor = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formateado = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroTarjeta(formateado);
  };

  const manejarVencimiento = (e) => {
    const valor = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (valor.length >= 3) {
      setVencimiento(`${valor.substring(0, 2)}/${valor.substring(2, 4)}`);
    } else {
      setVencimiento(valor);
    }
  };
  
  const procesarPagoSubmit = async (e) => {
  e.preventDefault();
  setErrorPago(null);
  setProcesando(true);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const usuarioSesion = sessionStorage.getItem('usuario');
  const emailUsuario = usuarioSesion ? JSON.parse(usuarioSesion).email : 'cliente@amaram.pe';
  
  let culqiTokenId = null; // Inicializamos en null

  try {
    // 🚀 PASO 1: Tokenización en Culqi SOLO si es TARJETA
    if (metodoPago === 'TARJETA') {
      const [mes, anio] = vencimiento.split('/');
      
      const payloadToken = {
        card_number: numeroTarjeta.replace(/\s/g, ''),
        cvv: cvv,
        expiration_month: parseInt(mes, 10),
        expiration_year: parseInt(`20${anio}`, 10),
        email: emailUsuario
      };

      // LLAMADA OFICIAL A CULQI TOKENIZACIÓN DE TARJETA
      const resToken = await axios.post('https://secure.culqi.com/v2/tokens', payloadToken, {
        headers: { Authorization: 'Bearer pk_test_aSv6AO0WcjkkrZLE' }
      });
      
      culqiTokenId = resToken.data.id; // Nos retorna tkn_test_xxxxxx
    } 
    // 💡 NOTA: Si el método de pago es YAPE (QR), nos saltamos la llamada a Culqi por completo.

    // 🚀 PASO 2: Enviar los datos estructurados a tu Backend
    const payloadBackend = {
      productos,
      monto_total: total,
      // Si el usuario eligió YAPE, mandamos al backend el método 'QR' para que sepa que es pago directo
      metodo_pago: metodoPago === 'YAPE' ? 'QR' : 'TARJETA',
      token_pago_id: culqiTokenId,
      // Mandamos el código de referencia que el usuario escribe opcionalmente en el QR
      codigo_referencia: metodoPago === 'YAPE' ? codigoReferencia : null,
      email: emailUsuario
    };

    // LLAMADA A TU SERVIDOR LOCAL
    const respuesta = await axios.post('https://amaram-backend.onrender.com/api/ventas', payloadBackend, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (respuesta.data.exito) {
      alConfirmarExito(respuesta.data.mensaje || '¡Pago aprobado con éxito!');
    } else {
      setErrorPago(respuesta.data.error || 'No se pudo procesar el pago.');
    }
  } catch (err) {
    console.error('Error procesando pago:', err);
    
    if (err.response?.data) {
      console.log('🚨 DETALLE DE LA RESPUESTA:', err.response.data);
    }
    
    const msgError = err.response?.data?.user_message || err.response?.data?.merchant_message || err.response?.data?.error || 'Error al conectar con la pasarela de pagos.';
    setErrorPago(msgError);
  } finally {
    setProcesando(false);
  }
};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      
      {/* Botón de retroceso */}
      <button 
        onClick={alCancelar} 
        style={{
          display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', 
          color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', padding: 0
        }}
      >
        ⬅️ Volver al carrito
      </button>

      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
        Método de Pago Seguro
      </h3>
      
      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
        Tu transacción está cifrada. Elige cómo deseas pagar tu total de <strong>S/ {parseFloat(total).toFixed(2)}</strong>.
      </p>

      {/* Selector de pestañas */}
      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => { setMetodoPago('TARJETA'); setErrorPago(null); }}
          style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
            backgroundColor: metodoPago === 'TARJETA' ? 'white' : 'transparent',
            color: metodoPago === 'TARJETA' ? '#1e293b' : '#64748b',
            boxShadow: metodoPago === 'TARJETA' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          💳 Tarjeta de Crédito/Débito
        </button>
        <button
          onClick={() => { setMetodoPago('YAPE'); setErrorPago(null); }}
          style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
            backgroundColor: metodoPago === 'YAPE' ? '#741864' : 'transparent',
            color: metodoPago === 'YAPE' ? 'white' : '#64748b',
            boxShadow: metodoPago === 'YAPE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🔮 Pagar con Yape
        </button>
      </div>

      {/* Alerta de Error en Pago */}
      {errorPago && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '10px 12px', borderRadius: '6px', color: '#ef4444', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>
          ⚠️ {errorPago}
        </div>
      )}

      {/* Formulario de Pago */}
      <form onSubmit={procesarPagoSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {metodoPago === 'TARJETA' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Tarjeta Virtual Interactiva */}
            <div style={{
              background: 'linear-gradient(135deg, #e85d75 0%, #8b5cf6 100%)', borderRadius: '12px', padding: '16px', color: 'white',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>AMARAM Premium Card</span>
                <span style={{ fontSize: '18px', fontWeight: 'italic' }}>💳</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', margin: '15px 0 10px 0', minHeight: '22px' }}>
                {numeroTarjeta || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '9px', textTransform: 'uppercase' }}>Titular</div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{nombreTarjeta || 'Nombre y Apellido'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ opacity: 0.7, fontSize: '9px', textTransform: 'uppercase' }}>Vence</div>
                  <div style={{ fontWeight: 'bold' }}>{vencimiento || 'MM/YY'}</div>
                </div>
              </div>
            </div>

            {/* Inputs de Tarjeta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Número de Tarjeta</label>
              <input
                type="text"
                required
                placeholder="0000 0000 0000 0000"
                value={numeroTarjeta}
                onChange={manejarNumeroTarjeta}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Nombre en la Tarjeta</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={nombreTarjeta}
                onChange={(e) => setNombreTarjeta(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Vencimiento</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={vencimiento}
                  onChange={manejarVencimiento}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', textAlign: 'center' }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>CVV</label>
                <input
                  type="password"
                  required
                  placeholder="•••"
                  maxLength="3"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '13px', color: '#475569', textAlign: 'center', lineHeight: '1.4' }}>
              Escanea este código con tu App de <strong>Yape</strong> o <strong>Plin</strong> y realiza la transferencia por el monto total de <strong>S/ {parseFloat(total).toFixed(2)}</strong>.
            </span>
            
            {/* Código QR SVG Directo */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '4px solid #741864', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <svg width="150" height="150" viewBox="0 0 29 29" shapeRendering="crispEdges">
                <path fill="#ffffff" d="M0 0h29v29H0z" />
                <path fill="#741864" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm9-22h2v2H9zm4 0h3v1h-3zm4 0h1v4h-1zm-4 2h2v2h-2zm4 2h1v1h-1zm-6 2h1v1H9zm2 0h2v1h-2zm-3 2h2v2H8zm3 0h3v2h-3zm4 0h2v1h-2zm3 0h2v1h-2zm-7 2h1v1H11zm3 0h1v1h-1zm2 0h1v1h-1zm-6 2h1v1H10zm2 0h2v2h-2zm4 0h1v1h-1zm1 0h1v1h-1zm-8 2h2v1H9zm4 0h1v1h-1zm2 0h1v1h-1zm1 0h3v1h-3zm-6 2h3v1h-3zm4 0h1v1h-1zm-6 1h2v2H8zm4 0h2v1h-2z" />
                <path fill="#00dbc3" d="M12 12h5v5h-5z" />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Número de Operación / Referencia (Opcional)</label>
              <input
                type="text" placeholder="Ej. 827439"
                value={codigoReferencia} onChange={(e) => setCodigoReferencia(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
              />
            </div>
          </div>
        )}

        {/* Botón de Confirmación de Pago */}
        <button
          type="submit"
          disabled={procesando}
          style={{
            width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px',
            cursor: procesando ? 'not-allowed' : 'pointer', marginTop: '30px', transition: 'background-color 0.2s',
            backgroundColor: metodoPago === 'YAPE' ? '#741864' : '#111827',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}
        >
          {procesando ? '⏳ Procesando Pago Seguro...' : `🔒 Pagar S/ ${parseFloat(total).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

// 🌟 Componente Principal (Exportado por defecto)
function Catalogo({ agregarAlCarrito, carritoAbierto, setCarritoAbierto, productosEnCarrito, setProductosEnCarrito }) {
  const navigate = useNavigate(); 
  const [procesando, setProcesando] = useState(false); 

  // 🌟 CAMBIO 2: Nuevo estado para alternar entre ver el carrito y ver el Checkout interactivo
  const [mostrarCheckout, setMostrarCheckout] = useState(false);

  // Estados para productos, filtros y paginación originales (100% INTANGIBLES)
  const [productos, setProductos] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);

  const productosPorPagina = 12; // 12 productos por página (3 filas de 4)
  const categoriesFiltro = ['Todos', 'Canastas', 'Crochet', 'Prendas', '🔥 Más vendidos', '✨ Nuevos'];

  // Colores pastel por si la imagen de la base de datos no carga
  const coloresPastel = ['#ff8e9b', '#88ebd1', '#add8e6', '#fcd34d', '#f9a8d4', '#d8b4fe', '#93c5fd', '#a7f3d0'];

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // 🌟 CAMBIO 3: Si se cierra la barra lateral, regresamos la vista por defecto al carrito normal
  useEffect(() => {
    if (!carritoAbierto) {
      setMostrarCheckout(false);
    }
  }, [carritoAbierto]);

  const cargarCatalogo = async () => {
    try {
      const res = await axios.get('https://amaram-backend.onrender.com/api/productos');
      setProductos(res.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const manejarAgregarAlCarrito = (producto) => {
    if (typeof agregarAlCarrito === 'function') {
      agregarAlCarrito(producto);
    }

    setProductosEnCarrito((itemsPrevios) => {
      const existe = itemsPrevios.find(item => item.id === producto.id);
      if (existe) {
        return itemsPrevios.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...itemsPrevios, { ...producto, cantidad: 1 }];
    });

    // Abrimos automáticamente el mini panel para darle feedback al usuario al estilo Amazon
    setCarritoAbierto(true);
  };

  // Modificar cantidades desde el Sidebar
  const cambiarCantidad = (id, incremento) => {
    setProductosEnCarrito((itemsPrevios) =>
      itemsPrevios
        .map(item => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + incremento;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean) // Elimina el producto si la cantidad llega a 0
    );
  };

  // 🌟 CAMBIO 4: Nueva función para pasar al formulario seguro tras validar la sesión del cliente
  const manejarProcederAlPago = () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      alert("Por favor, inicia sesión para poder finalizar tu compra en AMARAM.");
      setCarritoAbierto(false);
      navigate('/login');
      return;
    }
    setMostrarCheckout(true); // Abrimos la pasarela interactiva dentro de la barra lateral
  };

  // 🌟 CAMBIO 5: Recibe el éxito desde el CheckoutForm, vacía la sesión y redirige al dashboard del cliente
  const manejarPagoExitoso = (mensajeServidor) => {
    alert("🎉 " + mensajeServidor);
    setProductosEnCarrito([]); // Vacía el carrito
    setMostrarCheckout(false);  // Cierra la pasarela
    setCarritoAbierto(false);   // Cierra la barra lateral
    navigate('/dashboard-cliente'); // Envía a Mis Pedidos
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(prod => {
    if (filtroActivo === 'Todos') return true;
    if (filtroActivo === '🔥 Más vendidos') return prod.mas_vendido === true;
    if (filtroActivo === '✨ Nuevos') return prod.es_nuevo === true;

    return prod.categoria_nombre === filtroActivo || prod.categoria === filtroActivo;
  });

  // Reiniciar a la primera página si el usuario cambia de filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroActivo]);

  // Calcular productos para la página actual
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indexOfLastProduct = paginaActual * productosPorPagina;
  const indexOfFirstProduct = indexOfLastProduct - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexOfFirstProduct, indexOfLastProduct);

  // Cálculo dinámico del total acumulado para el carrito lateral
  const precioTotalCarrito = productosEnCarrito.reduce(
    (sum, item) => sum + Number(item.precio_unitario || 0) * item.cantidad,
    0
  );

  // Formateamos los productos como los requerirá tu base de datos y pasarela
  const productosFormateadosParaPago = productosEnCarrito.map(item => ({
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario
  }));

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Título adaptado para ir debajo del Header Global */}
        <h2 style={{ color: '#111827', fontSize: '28px', fontWeight: '800', marginBottom: '24px', marginTop: '0' }}>
          Nuestros Productos
        </h2>

        {/* Barra de Filtros */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '10px', marginBottom: '30px' }}>
          {categoriesFiltro.map(filtro => {
            const isActive = filtroActivo === filtro;
            return (
              <button
                key={filtro}
                onClick={() => setFiltroActivo(filtro)}
                style={{
                  padding: '8px 24px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? '#eb647c' : '#e5e7eb',
                  color: isActive ? 'white' : '#4b5563',
                  boxShadow: isActive ? '0 4px 6px rgba(235, 100, 124, 0.2)' : 'none'
                }}
              >
                {filtro}
              </button>
            );
          })}
        </div>

        {/* Mensaje si no hay productos */}
        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280', fontSize: '18px' }}>
            No se encontraron productos en esta categoría.
          </div>
        )}

        {/* Grilla de Productos (4 en fila en Desktop) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {productosPaginados.map((prod, index) => {
            const colorFondo = coloresPastel[(prod.id || index) % coloresPastel.length];

            return (
              <div key={prod.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease',
              }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >

                {/* Imagen y Etiqueta Nuevo */}
                <div style={{ height: '220px', backgroundColor: colorFondo, position: 'relative' }}>
                  {prod.imagen_url && (
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  {prod.es_nuevo && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#eb647c',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase'
                    }}>
                      Nuevo
                    </span>
                  )}
                </div>

                {/* Contenido de la Tarjeta */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#111827' }}>
                    {prod.nombre}
                  </h3>

                  <span style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', display: 'block' }}>
                    {prod.categoria_nombre || prod.categoria || 'General'}
                  </span>

                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {prod.descripcion || 'Artesanía hecha con amor por AMARAM.'}
                  </p>

                  {/* Precio */}
                  <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6' }}>
                      S/ {Number(prod.precio_unitario || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => manejarAgregarAlCarrito(prod)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#eb647c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d6546b'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#eb647c'}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '50px' }}>
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(prev => prev - 1)}
              style={{
                padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                backgroundColor: paginaActual === 1 ? '#f3f4f6' : 'white', color: paginaActual === 1 ? '#9ca3af' : '#4b5563', border: '1px solid #e5e7eb'
              }}
            >
              Anterior
            </button>

            {[...Array(totalPaginas)].map((_, i) => {
              const isCurrent = paginaActual === i + 1;
              return (
                <button
                  key={i}
                  onClick={() => setPaginaActual(i + 1)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s',
                    backgroundColor: isCurrent ? '#eb647c' : 'white', color: isCurrent ? 'white' : '#4b5563', border: isCurrent ? 'none' : '1px solid #e5e7eb'
                  }}
                >
                  {i + 1}
                </button>
              );
            })}

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(prev => prev - 1)}
              style={{
                padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                backgroundColor: paginaActual === totalPaginas ? '#f3f4f6' : 'white', color: paginaActual === totalPaginas ? '#9ca3af' : '#4b5563', border: '1px solid #e5e7eb'
              }}
            >
              Siguiente
            </button>
          </div>
        )}

      </div>

      {/* 🛒 MINI-PÁGINA LATERAL DESPLEGABLE */}
      {carritoAbierto && (
        <>
          <div
            onClick={() => setCarritoAbierto(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 }}
          />

          <div style={{ position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', backgroundColor: 'white', boxShadow: '-5px 0 25px rgba(0,0,0,0.15)', zIndex: 10000, display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: '800' }}>
                {/* Cabecera dinámica que cambia al estar en la pasarela */}
                {mostrarCheckout ? '🔒 Checkout Seguro' : '🛒 Mi Carrito'}
              </h3>
              <button onClick={() => setCarritoAbierto(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            {/* 🌟 CAMBIO 6: Renderizado condicional del nuevo CheckoutForm directamente integrado */}
            {mostrarCheckout ? (
              <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                <CheckoutForm 
                  total={precioTotalCarrito}
                  productos={productosFormateadosParaPago}
                  alConfirmarExito={manejarPagoExitoso}
                  alCancelar={() => setMostrarCheckout(false)}
                />
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
                  {productosEnCarrito.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>
                      <p style={{ fontSize: '15px' }}>Tu carrito está vacío.</p>
                      <p style={{ fontSize: '13px' }}>¡Agrega lindos productos de AMARAM!</p>
                    </div>
                  ) : (
                    productosEnCarrito.map((item, index) => (
                      <div key={item.id || index} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: coloresPastel[(item.id || index) % coloresPastel.length], overflow: 'hidden', flexShrink: 0 }}>
                          {item.imagen_url && <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '14px', fontWeight: '700' }}>{item.nombre}</h4>
                          <span style={{ color: '#8b5cf6', fontWeight: '800', fontSize: '14px' }}>S/ {Number(item.precio_unitario || 0).toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '20px' }}>
                          <button onClick={() => cambiarCantidad(item.id, -1)} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#4b5563', padding: '0 4px' }}>-</button>
                          <span style={{ fontWeight: '800', fontSize: '13px', color: '#111827', minWidth: '16px', textAlign: 'center' }}>{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item.id, 1)} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#4b5563', padding: '0 4px' }}>+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#4b5563' }}>Subtotal estimado:</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#8b5cf6' }}>S/ {precioTotalCarrito.toFixed(2)}</span>
                  </div>

                  <button
                    disabled={productosEnCarrito.length === 0 || procesando}
                    onClick={manejarProcederAlPago} // 🌟 Enlazamos al disparador del Checkout
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: (productosEnCarrito.length === 0 || procesando) ? '#d1d5db' : '#111827',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '16px',
                      cursor: (productosEnCarrito.length === 0 || procesando) ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                      boxShadow: (productosEnCarrito.length === 0 || procesando) ? 'none' : '0 10px 15px -3px rgba(17, 24, 39, 0.3)'
                    }}
                    onMouseOver={(e) => { if (productosEnCarrito.length > 0 && !procesando) e.target.style.backgroundColor = '#1f2937'; }}
                    onMouseOut={(e) => { if (productosEnCarrito.length > 0 && !procesando) e.target.style.backgroundColor = '#111827'; }}
                  >
                    🔒 Proceder al Pago Seguro
                  </button>
                </div>
              </>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default Catalogo;