import React, { useEffect, useState } from "react";
import { useSigninCheck, useFirebaseApp, useUser, useAuth } from "reactfire";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore/lite";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const palette = {
  beige: "#f5ecd7",
  brown: "#8d6748",
  offWhite: "#fffaf3",
  accent: "#c2a77d",
  darkBrown: "#5d4037",
  lightBeige: "#faf4e8"
};

export const UserProfile: React.FC = () => {
  const { data: signInCheckResult } = useSigninCheck();
  const { data: user } = useUser();
  const app = useFirebaseApp();
  const [section, setSection] = useState(0);
  const [profile, setProfile] = useState({ 
    nombre: "", 
    telefono: "", 
    municipio: "", 
    departamento: "", 
    email: "" 
  });
  const [form, setForm] = useState(profile);
  const [editing, setEditing] = useState(false);
  
  interface Product {
    imagen: string;
    nombre: string;
    talla: string;
  }
  
  interface Order {
    id: string;
    fecha?: { seconds: number };
    estado?: string;
    productos?: Product[];
    total?: number;
  }
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      if (!signInCheckResult?.signedIn) return;
      setLoading(true);
      const firestore = getFirestore(app);
      const userId = signInCheckResult.user.uid;
      
      // Perfil
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.exists() ? userSnap.data() : {};
      
      setProfile({
        nombre: data.nombre || (user?.displayName ?? ""),
        telefono: data.telefono || "",
        municipio: data.municipio || "",
        departamento: data.departamento || "",
        email: data.email || (user?.email ?? "")
      });
      
      setForm({
        nombre: data.nombre || (user?.displayName ?? ""),
        telefono: data.telefono || "",
        municipio: data.municipio || "",
        departamento: data.departamento || "",
        email: data.email || (user?.email ?? "")
      });
      
      // Pedidos
      const ordersRef = collection(firestore, "orders");
      const q = query(ordersRef, where("id_usuario", "==", userId));
      const ordersSnap = await getDocs(q);
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    
    fetchProfileAndOrders();
  }, [app, signInCheckResult, user]);

  // Validación
  const validate = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!form.telefono.match(/^\d{8}$/)) return "El teléfono debe tener 8 dígitos.";
    if (!form.municipio.trim()) return "El municipio es obligatorio.";
    if (!form.departamento.trim()) return "El departamento es obligatorio.";
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      await MySwal.fire({ 
        icon: "error", 
        title: "Error de validación", 
        text: error, 
        confirmButtonColor: palette.brown 
      });
      return;
    }
    
    setSaving(true);
    try {
      if (!signInCheckResult?.user) throw new Error("Usuario no autenticado");
      const firestore = getFirestore(app);
      const userId = signInCheckResult.user.uid;
      
      await updateDoc(doc(firestore, "users", userId), {
        nombre: form.nombre,
        telefono: form.telefono,
        municipio: form.municipio,
        departamento: form.departamento
      });
      
      setProfile({ ...form, email: profile.email });
      setEditing(false);
      
      await MySwal.fire({ 
        icon: "success", 
        title: "¡Guardado!", 
        text: "Tus datos han sido actualizados.", 
        confirmButtonColor: palette.brown 
      });
    } catch {
      await MySwal.fire({ 
        icon: "error", 
        title: "Error", 
        text: "No se pudo guardar la información.", 
        confirmButtonColor: palette.brown 
      });
    }
    setSaving(false);
  };

  const auth = useAuth();
  const handleLogout = async () => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "¿Cerrar sesión?",
      text: "¿Seguro que deseas cerrar sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: palette.brown,
      cancelButtonColor: palette.beige
    });
    if (result.isConfirmed) {
      try {
        await auth.signOut();
        window.location.href = "/";
      } catch {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cerrar la sesión.",
          confirmButtonColor: palette.brown
        });
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: palette.brown }}></div>
    </div>
  );
  
  if (!signInCheckResult?.signedIn) return (
    <div className="text-center py-20 text-lg" style={{ color: palette.brown }}>
      Debes iniciar sesión para ver tu perfil.
    </div>
  );

  return (
    <div style={{ background: palette.lightBeige, minHeight: "100vh" }} className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: palette.darkBrown }}>Mi Cuenta</h1>
          <p className="text-lg" style={{ color: palette.brown }}>Gestiona tu información y pedidos</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar mejorado */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b" style={{ borderColor: palette.beige }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" 
                       style={{ background: palette.brown }}>
                    {profile.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: palette.darkBrown }}>{profile.nombre}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setSection(0)} 
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${section === 0 ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      style={{ 
                        background: section === 0 ? palette.beige : 'transparent',
                        color: section === 0 ? palette.darkBrown : 'inherit'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Información Personal
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setSection(1)} 
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${section === 1 ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      style={{ 
                        background: section === 1 ? palette.beige : 'transparent',
                        color: section === 1 ? palette.darkBrown : 'inherit'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      Historial de Pedidos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setSection(2)} 
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${section === 2 ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      style={{ 
                        background: section === 2 ? palette.beige : 'transparent',
                        color: section === 2 ? palette.darkBrown : 'inherit'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Sección Información personal */}
              {section === 0 && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: palette.darkBrown }}>Información Personal</h2>
                    {!editing && (
                      <button 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ background: palette.beige, color: palette.brown }}
                        onClick={() => setEditing(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Editar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: palette.darkBrown }}>Nombre</label>
                      <input
                        type="text"
                        className={`w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[${palette.accent}] focus:ring-opacity-50`} 
                        value={editing ? form.nombre : profile.nombre}
                        disabled={!editing}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                        style={{ 
                          borderColor: editing ? palette.accent : palette.beige,
                          background: editing ? 'white' : palette.lightBeige
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: palette.darkBrown }}>Teléfono</label>
                      <input
                        type="tel"
                        className={`w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[${palette.accent}] focus:ring-opacity-50`} 
                        value={editing ? form.telefono : profile.telefono}
                        disabled={!editing}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                        placeholder="Ej: 12345678"
                        style={{ 
                          borderColor: editing ? palette.accent : palette.beige,
                          background: editing ? 'white' : palette.lightBeige
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: palette.darkBrown }}>Municipio</label>
                      <input
                        type="text"
                        className={`w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[${palette.accent}] focus:ring-opacity-50`} 
                        value={editing ? form.municipio : profile.municipio}
                        disabled={!editing}
                        onChange={e => setForm(f => ({ ...f, municipio: e.target.value }))}
                        style={{ 
                          borderColor: editing ? palette.accent : palette.beige,
                          background: editing ? 'white' : palette.lightBeige
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: palette.darkBrown }}>Departamento</label>
                      <input
                        type="text"
                        className={`w-full border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[${palette.accent}] focus:ring-opacity-50`} 
                        value={editing ? form.departamento : profile.departamento}
                        disabled={!editing}
                        onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}
                        style={{ 
                          borderColor: editing ? palette.accent : palette.beige,
                          background: editing ? 'white' : palette.lightBeige
                        }}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: palette.darkBrown }}>Correo electrónico</label>
                      <input
                        type="email"
                        className="w-full border rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                        value={profile.email}
                        disabled
                        readOnly
                        style={{ borderColor: palette.beige }}
                      />
                      <p className="text-xs mt-1 text-gray-500">El correo electrónico no se puede modificar desde aquí.</p>
                    </div>
                  </div>
                  
                  {editing && (
                    <div className="flex gap-3 mt-8">
                      <button 
                        className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        style={{ background: palette.brown, color: 'white' }}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Guardar cambios
                          </>
                        )}
                      </button>
                      <button 
                        className="px-6 py-3 rounded-lg font-medium transition-colors border"
                        style={{ borderColor: palette.brown, color: palette.brown }}
                        onClick={() => { setEditing(false); setForm(profile); }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sección Pedidos */}
              {section === 1 && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: palette.darkBrown }}>Historial de Pedidos</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" style={{ color: palette.beige }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-xl font-medium mb-2" style={{ color: palette.darkBrown }}>No tienes pedidos</h3>
                      <p className="text-gray-600 mb-6">Cuando realices tu primer pedido, aparecerá aquí.</p>
                      <a href="/" className="inline-block px-6 py-3 rounded-lg font-medium" style={{ background: palette.brown, color: 'white' }}>
                        Continuar comprando
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="border rounded-xl overflow-hidden" style={{ borderColor: palette.beige }}>
                          <div className="p-5 bg-gray-50 flex flex-wrap justify-between items-center gap-4" style={{ background: palette.lightBeige }}>
                            <div>
                              <h3 className="font-bold text-lg" style={{ color: palette.darkBrown }}>Pedido #{order.id}</h3>
                              <p className="text-sm text-gray-600">
                                {order.fecha ? new Date(order.fecha.seconds * 1000).toLocaleDateString('es-ES', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) : 'Fecha no disponible'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.estado === "Procesando" ? "bg-yellow-100 text-yellow-800" : order.estado === "Enviado" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                {order.estado || "Procesando"}
                              </span>
                              <span className="font-bold text-lg" style={{ color: palette.darkBrown }}>${order.total || 0}</span>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <h4 className="font-medium mb-3" style={{ color: palette.darkBrown }}>Productos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {order.productos?.map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: palette.beige }}>
                                  <img 
                                    src={prod.imagen} 
                                    alt={prod.nombre} 
                                    className="w-16 h-16 object-cover rounded-md" 
                                  />
                                  <div>
                                    <p className="font-medium" style={{ color: palette.darkBrown }}>{prod.nombre}</p>
                                    <p className="text-sm text-gray-600">Talla: {prod.talla}</p>
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
              )}
              
              {/* Sección Cerrar Sesión */}
              {section === 2 && (
                <div className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: palette.beige }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{ color: palette.brown }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4" style={{ color: palette.darkBrown }}>Cerrar Sesión</h2>
                    <p className="text-gray-600 mb-8">
                      ¿Estás seguro de que deseas cerrar tu sesión? Podrás volver a iniciar sesión en cualquier momento.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        style={{ background: palette.brown, color: 'white' }}
                        onClick={handleLogout}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Sí, cerrar sesión
                      </button>
                      <button 
                        className="px-6 py-3 rounded-lg font-medium transition-colors border"
                        style={{ borderColor: palette.brown, color: palette.brown }}
                        onClick={() => setSection(0)}
                      >
                        Cancelar
                      </button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t" style={{ borderColor: palette.beige }}>
                      <p className="text-sm text-gray-600">
                        Para gestionar tu contraseña, visita tu{' '}
                        <a 
                          href="https://myaccount.google.com/security" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium underline"
                          style={{ color: palette.brown }}
                        >
                          cuenta de Google
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};