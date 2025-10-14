import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, Timestamp, updateDoc, doc } from "firebase/firestore";
import { getApp } from "firebase/app";

// Tipos
export type PedidoCartItem = {
  id_producto: string;
  cantidad: number;
  talla_seleccionada: string;
  nombre: string;
  precio: number;
  imagen: string;
};

export type Pedido = {
  id: string;
  id_usuario: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  metodoPago: string;
  notas: string;
  cartItems: PedidoCartItem[];
  total: number;
  fecha: Timestamp;
  estado: string;
};

const OrderPage = () => {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES');
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const firestore = getFirestore(getApp());
        const ordersRef = collection(firestore, "orders");
        const snapshot = await getDocs(ordersRef);
        const pedidos: Pedido[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            id_usuario: data.id_usuario,
            nombre: data.nombre,
            direccion: data.direccion,
            telefono: data.telefono,
            email: data.email,
            metodoPago: data.metodoPago,
            notas: data.notas,
            cartItems: data.cartItems,
            total: data.total,
            fecha: data.fecha,
            estado: data.estado,
          };
        });
        // Ordenar por fecha más reciente primero
        pedidos.sort((a, b) => b.fecha?.toMillis() - a.fecha?.toMillis());
        setOrders(pedidos);
        setFilteredOrders(pedidos);
      } catch (err) {
        setError('Error al cargar las órdenes');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtros y búsqueda
// Filtros y búsqueda
useEffect(() => {
  let result = [...orders];

  if (searchId.trim()) {
    result = result.filter(order => order.id.toLowerCase().includes(searchId.trim().toLowerCase()));
  }

  if (estadoFilter) {
    result = result.filter(order => order.estado === estadoFilter);
  }

  // 🔥 Filtro por fecha comparando solo día, mes y año
  if (fechaInicio) {
    const [inicioYear, inicioMonth, inicioDay] = fechaInicio.split('-').map(Number);
    
    result = result.filter(order => {
      const orderDate = order.fecha.toDate();
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1; // getMonth() devuelve 0-11
      const orderDay = orderDate.getDate();
      
      // Comparar año, mes y día
      if (orderYear > inicioYear) return true;
      if (orderYear < inicioYear) return false;
      if (orderMonth > inicioMonth) return true;
      if (orderMonth < inicioMonth) return false;
      return orderDay >= inicioDay;
    });
  }

  if (fechaFin) {
    const [finYear, finMonth, finDay] = fechaFin.split('-').map(Number);
    
    result = result.filter(order => {
      const orderDate = order.fecha.toDate();
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1; // getMonth() devuelve 0-11
      const orderDay = orderDate.getDate();
      
      // Comparar año, mes y día
      if (orderYear < finYear) return true;
      if (orderYear > finYear) return false;
      if (orderMonth < finMonth) return true;
      if (orderMonth > finMonth) return false;
      return orderDay <= finDay;
    });
  }

  setFilteredOrders(result);
}, [orders, searchId, estadoFilter, fechaInicio, fechaFin]);


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        {error}
      </div>
    );
  }

  // ...existing code...
  const estados = ["Pendiente", "En preparación", "Enviado", "Entregado"];

  const handleEstadoChange = async (orderId: string, newEstado: string) => {
    try {
      const firestore = getFirestore(getApp());
      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, { estado: newEstado });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newEstado } : o));
    } catch (err) {
      alert("Error al actualizar el estado");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Órdenes Realizadas</h1>
        <p>{filteredOrders.length} {filteredOrders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}</p>
        {/* Filtros y búsqueda */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Buscar por número de orden"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
          />
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No hay órdenes registradas</p>
          <p>Cuando se realicen pedidos, aparecerán aquí.</p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <div 
              key={order.id}
              style={{ 
                border: '1px solid #ddd', 
                marginBottom: '20px', 
                padding: '20px',
                borderRadius: '4px'
              }}
            >
              {/* ...existing code for each order... */}
              {/* Header del pedido */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '15px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>
                    Orden #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                      value={order.estado}
                      onChange={e => handleEstadoChange(order.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '14px', background: '#f0f0f0', border: '1px solid #ccc' }}
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {formatDate(order.fecha)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <strong style={{ fontSize: '18px' }}>
                    ${order.total?.toFixed(2) || '0.00'}
                  </strong>
                </div>
              </div>

              <hr style={{ margin: '15px 0' }} />

              {/* Información del cliente y pago */}
              <div style={{ 
                display: 'flex', 
                gap: '30px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                {/* Información del cliente */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Información del Cliente</h4>
                  <div>
                    <p style={{ margin: '5px 0' }}><strong>Nombre:</strong> {order.nombre}</p>
                    <p style={{ margin: '5px 0' }}><strong>Email:</strong> {order.email}</p>
                    <p style={{ margin: '5px 0' }}><strong>Teléfono:</strong> {order.telefono}</p>
                    <p style={{ margin: '5px 0' }}><strong>Dirección:</strong> {order.direccion}</p>
                  </div>
                </div>

                {/* Información del pago */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Información del Pago</h4>
                  <div>
                    <p style={{ margin: '5px 0' }}><strong>Método de pago:</strong> {order.metodoPago}</p>
                    {order.notas && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>Notas:</strong> {order.notas}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <hr style={{ margin: '15px 0' }} />

              {/* Productos */}
              <div>
                <h4 style={{ marginBottom: '15px' }}>
                  Productos ({order.cartItems?.length || 0})
                </h4>
                
                <div>
                  {order.cartItems?.map((item: PedidoCartItem, idx: number) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                    >
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        style={{ 
                          width: '50px', 
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                          {item.nombre}
                        </p>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                          Talla: {item.talla_seleccionada} | Cantidad: {item.cantidad}
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                          ${item.precio?.toFixed(2)} c/u
                        </p>
                      </div>
                      <div>
                        <strong>${(item.precio * item.cantidad)?.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;