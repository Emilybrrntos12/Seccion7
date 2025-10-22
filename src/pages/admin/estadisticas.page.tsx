import React, { useEffect, useState } from "react";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";


const EstadisticasPage: React.FC = () => {
  const app = useFirebaseApp();
  const [data, setData] = useState([
    { puntuacion: 1, cantidad: 0 },
    { puntuacion: 2, cantidad: 0 },
    { puntuacion: 3, cantidad: 0 },
    { puntuacion: 4, cantidad: 0 },
    { puntuacion: 5, cantidad: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  // Para la gráfica de confianza
  const [confianzaData, setConfianzaData] = useState([
    { confianza: 1, cantidad: 0 },
    { confianza: 2, cantidad: 0 },
    { confianza: 3, cantidad: 0 },
    { confianza: 4, cantidad: 0 },
    { confianza: 5, cantidad: 0 },
  ]);
  const [confianzaTotal, setConfianzaTotal] = useState(0);
  const [loadingConfianza, setLoadingConfianza] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const snapshot = await getDocs(collection(firestore, "reviews"));
      const puntuaciones = [0, 0, 0, 0, 0];
      let totalReviews = 0;
      snapshot.forEach(doc => {
        const r = doc.data();
        if (r.puntuacion >= 1 && r.puntuacion <= 5) {
          puntuaciones[r.puntuacion - 1]++;
          totalReviews++;
        }
      });
      setData([
        { puntuacion: 1, cantidad: puntuaciones[0] },
        { puntuacion: 2, cantidad: puntuaciones[1] },
        { puntuacion: 3, cantidad: puntuaciones[2] },
        { puntuacion: 4, cantidad: puntuaciones[3] },
        { puntuacion: 5, cantidad: puntuaciones[4] },
      ]);
      setTotal(totalReviews);
      setLoading(false);
    };
    fetchReviews();
  }, [app]);

  // Gráfica de confianza
  useEffect(() => {
    const fetchConfianza = async () => {
      setLoadingConfianza(true);
      const firestore = getFirestore(app);
      const snapshot = await getDocs(collection(firestore, "encuestas"));
      const confianzaArr = [0, 0, 0, 0, 0];
      let totalConfianza = 0;
      snapshot.forEach(doc => {
        const r = doc.data();
        if (r.confianza >= 1 && r.confianza <= 5) {
          confianzaArr[r.confianza - 1]++;
          totalConfianza++;
        }
      });
      setConfianzaData([
        { confianza: 1, cantidad: confianzaArr[0] },
        { confianza: 2, cantidad: confianzaArr[1] },
        { confianza: 3, cantidad: confianzaArr[2] },
        { confianza: 4, cantidad: confianzaArr[3] },
        { confianza: 5, cantidad: confianzaArr[4] },
      ]);
      setConfianzaTotal(totalConfianza);
      setLoadingConfianza(false);
    };
    fetchConfianza();
  }, [app]);

  return (
    <div style={{ padding: 32 }}>
      <h1>Estadística de puntuaciones de reviews</h1>
      <p>Distribución de puntuaciones (1 a 5) de los usuarios sobre los productos.</p>
      {loading ? (
        <div>Cargando reviews...</div>
      ) : (
        <>
          <div style={{ fontWeight: 500, marginBottom: 16 }}>
            Total de respuestas: {total}
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="puntuacion" tick={{ fontSize: 16 }} label={{ value: "Puntuación", position: "insideBottom", offset: -10 }} />
              <YAxis allowDecimals={false} label={{ value: "Cantidad", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => `${value} reviews`} />
              <Bar dataKey="cantidad" fill="#1976d2">
                <LabelList dataKey="cantidad" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      <hr style={{ margin: '40px 0' }} />
      <h2>¿Qué tan seguro se sintió el usuario al comprar?</h2>
      <p>Distribución de respuestas de confianza (1 = nada seguro, 5 = totalmente seguro).</p>
      {loadingConfianza ? (
        <div>Cargando confianza...</div>
      ) : (
        <>
          <div style={{ fontWeight: 500, marginBottom: 16 }}>
            Total de respuestas: {confianzaTotal}
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={confianzaData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="confianza" tick={{ fontSize: 16 }} label={{ value: "Confianza", position: "insideBottom", offset: -10 }} />
              <YAxis allowDecimals={false} label={{ value: "Cantidad", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => `${value} respuestas`} />
              <Bar dataKey="cantidad" fill="#43a047">
                <LabelList dataKey="cantidad" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default EstadisticasPage;