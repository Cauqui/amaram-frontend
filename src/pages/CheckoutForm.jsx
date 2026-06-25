import React, { useState } from 'react';
import axios from 'axios';

const CheckoutForm = ({ total, productos, alConfirmarExito, alCancelar }) => {
  const [metodoPago, setMetodoPago] = useState('TARJETA'); 
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState(null);

  // Estados para el Formulario de Tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados para el Formulario de Yape
  const [celularYape, setCelularYape] = useState('');
  const [codigoYape, setCodigoYape] = useState('');

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

  const manejarCelular = (e) => {
    const valor = e.target.value.replace(/\D/g, '').substring(0, 9);
    setCelularYape(valor);
  };

  const manejarCodigoYape = (e) => {
    const valor = e.target.value.replace(/\D/g, '').substring(0, 6);
    setCodigoYape(valor);
  };

  // 🛡️ OWASP A02:2025 - Función de Limpieza de Memoria Volátil Pos-Venta
  const limpiarFormularioSeguro = () => {
    setNumeroTarjeta('');
    setNombreTarjeta('');
    setVencimiento('');
    setCvv('');
    setCelularYape('');
    setCodigoYape('');
  };

  const procesarPagoSubmit = async (e) => {
    e.preventDefault();
    setErrorPago(null);
    setProcesando(true);

    const tokenSession = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // 🛡️ CUMPLIMIENTO PCI-DSS / OWASP A02: Tokenización en el Cliente
    // Simulamos la API de Culqi generando un token cifrado efímero en el frontend.
    // Con esto, los números de la tarjeta JAMÁS viajan al backend ni tocan la base de datos de AMARAM.
    let tokenPagoGenerado = null;
    let codigoReferencia = null;

    if (metodoPago === 'TARJETA') {
      const ultimosCuatro = numeroTarjeta.replace(/\s/g, '').slice(-4);
      tokenPagoGenerado = `tkn_test_${Math.random().toString(36).substring(2, 10)}_${ultimosCuatro}`;
    } else {
      codigoReferencia = codigoYape;
    }

    const payload = {
      productos,
      monto_total: total,
      metodo_pago: metodoPago,
      token_pago_id: tokenPagoGenerado, // Solo viaja el token seguro
      codigo_referencia: codigoReferencia,
      email: 'cliente@amaram.pe'
    };

    try {
      // Petición al backend seguro
      const respuesta = await axios.post('http://localhost:3000/api/ventas', payload, {
        headers: { Authorization: `Bearer ${tokenSession}` }
      });

      if (respuesta.data.exito) {
        // 🛡️ Destrucción de datos sensibles en el estado tras confirmación exitosa
        limpiarFormularioSeguro();
        alConfirmarExito(respuesta.data.mensaje || '¡Pago aprobado con éxito!');
      } else {
        setErrorPago(respuesta.data.error || 'No se pudo procesar el pago.');
      }
    } catch (err) {
      console.error('🚨 [CHECKOUT EXCEPTION] Error procesando pago:', err.message);
      setErrorPago(err.response?.data?.mensaje || 'Error al conectar con la pasarela de pagos.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
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
          type="button"
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
          type="button"
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

      {errorPago && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '10px 12px', borderRadius: '6px', color: '#ef4444', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>
          ⚠️ {errorPago}
        </div>
      )}

      <form onSubmit={procesarPagoSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {metodoPago === 'TARJETA' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Tarjeta Virtual */}
            <div style={{
              background: 'linear-gradient(135deg, #e85d75 0%, #8b5cf6 100%)', borderRadius: '12px', padding: '16px', color: 'white',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>AMARAM Premium Card</span>
                <span style={{ fontSize: '18px' }}>💳</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              backgroundColor: '#741864', borderRadius: '12px', padding: '16px', color: 'white',
              boxShadow: '0 4px 10px rgba(116, 24, 100, 0.15)', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ backgroundColor: '#00dbc3', color: '#741864', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px' }}>
                Y
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Pago Directo con Yape</div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>Ingresa tu número y código de aprobación.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Número de Celular Yape</label>
              <input
                type="text"
                required
                placeholder="Ej. 987654321"
                value={celularYape}
                onChange={manejarCelular}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Código de Aprobación (6 dígitos)</label>
              <input
                type="text"
                required
                placeholder="000 000"
                value={codigoYape}
                onChange={manejarCodigoYape}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                * Búscalo en tu App Yape en el menú "Código de aprobación".
              </span>
            </div>
          </div>
        )}

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

export default CheckoutForm;