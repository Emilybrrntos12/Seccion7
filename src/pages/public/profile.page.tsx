import React, { useEffect, useState } from "react";
import { useSigninCheck, useFirebaseApp } from "reactfire";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore/lite";

export const ProfilePage: React.FC = () => {
  const { data: signInCheckResult } = useSigninCheck();
  const app = useFirebaseApp();
  interface Profile {
    nombre: string;
    apellido: string;
    email: string;
  }
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: "", apellido: "" });
  interface Order {
    id: string;
    fecha?: { seconds: number };
    total?: number;
    // Puedes agregar más campos según tu modelo
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
      // Obtener perfil
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || signInCheckResult.user.email || ""
        });
        setForm({
          nombre: data.nombre || "",
          apellido: data.apellido || ""
        });
      }
      // Obtener pedidos
      const ordersRef = collection(firestore, "orders");
      const q = query(ordersRef, where("id_usuario", "==", userId));
      const ordersSnap = await getDocs(q);
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchProfileAndOrders();
  }, [app, signInCheckResult]);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
  setForm({ nombre: profile?.nombre || "", apellido: profile?.apellido || "" });
  };
  const handleSave = async () => {
    if (!signInCheckResult?.signedIn) return;
    setSaving(true);
    const firestore = getFirestore(app);
    const userId = signInCheckResult.user.uid;
    await updateDoc(doc(firestore, "users", userId), {
      nombre: form.nombre,
      apellido: form.apellido
    });
    setProfile({
      nombre: form.nombre,
      apellido: form.apellido,
      email: profile?.email || ""
    });
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (!signInCheckResult?.signedIn) return <div>Debes iniciar sesión para ver tu perfil.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Perfil del Usuario</h2>
      <div className="bg-white rounded shadow p-4 mb-6">
        {editing ? (
          <>
            <div className="mb-2">
              <label className="block text-sm font-semibold">Nombre</label>
              <input
                type="text"
                className="border rounded px-2 py-1 w-full"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold">Apellido</label>
              <input
                type="text"
                className="border rounded px-2 py-1 w-full"
                value={form.apellido}
                onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="bg-primary text-white px-4 py-2 rounded" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2"><span className="font-semibold">Nombre:</span> {profile?.nombre}</div>
            <div className="mb-2"><span className="font-semibold">Apellido:</span> {profile?.apellido}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {profile?.email}</div>
            <button className="bg-primary text-white px-4 py-2 rounded" onClick={handleEdit}>Editar</button>
          </>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2">Pedidos anteriores</h3>
      <div className="bg-white rounded shadow p-4">
        {orders.length === 0 ? (
          <div>No tienes pedidos anteriores.</div>
        ) : (
          <ul className="space-y-3">
            {orders.map(order => (
              <li key={order.id} className="border rounded p-3">
                <div className="font-semibold">Pedido #{order.id}</div>
                <div className="text-sm text-gray-600">Fecha: {order.fecha ? new Date(order.fecha.seconds * 1000).toLocaleString() : ""}</div>
                <div className="text-sm">Total: ${order.total || 0}</div>
                {/* Puedes mostrar más detalles del pedido aquí */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
