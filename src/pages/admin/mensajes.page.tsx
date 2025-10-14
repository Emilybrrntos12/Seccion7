import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import { useFirebaseApp } from "reactfire";
import Header from "../../components/ui/header";

interface Mensaje {
  id: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  fecha: { seconds: number } | Date;
  uid?: string;
}

export const MensajesAdmin: React.FC = () => {
  const app = useFirebaseApp();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMensajes = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const snap = await getDocs(collection(firestore, "contact_messages"));
      setMensajes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensaje)));
      setLoading(false);
    };
    fetchMensajes();
  }, [app]);

  return (
    <>
      <Header />
      <section className="bg-[#f5ecd7] py-12 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#8d6748] mb-8 text-center">Mensajes de Contacto</h1>
          {loading ? (
            <div className="text-center text-[#8d6748] py-10">Cargando mensajes...</div>
          ) : mensajes.length === 0 ? (
            <div className="text-center text-[#8d6748] py-10">No hay mensajes enviados por los usuarios.</div>
          ) : (
            <div className="space-y-6">
              {mensajes.map(msg => (
                <div key={msg.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                    <div>
                      <p className="font-bold text-[#8d6748] text-lg">{msg.nombre}</p>
                      <p className="text-[#5d4037] text-sm">{msg.email}</p>
                    </div>
                    <div className="text-right text-[#5d4037] text-sm">
                      {msg.fecha instanceof Date
                        ? msg.fecha.toLocaleString()
                        : typeof msg.fecha === "object" && "seconds" in msg.fecha
                          ? new Date((msg.fecha as { seconds: number }).seconds * 1000).toLocaleString()
                          : "Fecha no disponible"}
                    </div>
                  </div>
                  <p className="font-semibold text-[#8d6748] mb-1">Asunto: <span className="font-normal text-[#5d4037]">{msg.asunto}</span></p>
                  <p className="text-[#5d4037] mb-2">{msg.mensaje}</p>
                  {msg.uid && (
                    <p className="text-xs text-gray-500">UID usuario: {msg.uid}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
