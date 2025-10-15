import React, { useState } from "react";
import { useParams, } from "react-router-dom";
import { Button, Box, Typography, RadioGroup, FormControlLabel, Radio, Alert } from "@mui/material";
import { getFirestore, collection, addDoc } from "firebase/firestore/lite";
import { useFirebaseApp, useUser } from "reactfire";

interface EncuestaCompraProps {
  orderId?: string;
}

export const EncuestaCompra: React.FC<EncuestaCompraProps> = ({ orderId }) => {
  const params = useParams();
  const finalOrderId = orderId || params.orderId;
  const app = useFirebaseApp();
  const { data: user } = useUser();
  const [confianza, setConfianza] = useState<string>("");
  const [recomienda, setRecomienda] = useState<string>("");
  const [enviada, setEnviada] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confianza || !recomienda) return;
    setLoading(true);
    const firestore = getFirestore(app);
    await addDoc(collection(firestore, "encuestas"), {
      orderId: finalOrderId,
      userId: user?.uid,
      confianza,
      recomienda,
      createdAt: new Date().toISOString()
    });
    setEnviada(true);
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
      <Alert severity="info" sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          ¡Ayúdanos a mejorar!
        </Typography>
        <form onSubmit={handleSubmit}>
          <Typography sx={{ mb: 1 }}>
            ¿Qué tan seguro te sentiste al realizar tu compra?
          </Typography>
          <RadioGroup
            row
            value={confianza}
            onChange={e => setConfianza(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="1" control={<Radio />} label="😟" />
            <FormControlLabel value="2" control={<Radio />} label="😕" />
            <FormControlLabel value="3" control={<Radio />} label="😐" />
            <FormControlLabel value="4" control={<Radio />} label="🙂" />
            <FormControlLabel value="5" control={<Radio />} label="😃" />
          </RadioGroup>

          <Typography sx={{ mb: 1 }}>
            ¿Recomendarías nuestra tienda a otras personas?
          </Typography>
          <RadioGroup
            row
            value={recomienda}
            onChange={e => setRecomienda(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="si" control={<Radio />} label="Sí" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="talvez" control={<Radio />} label="Tal vez" />
          </RadioGroup>

          {!enviada ? (
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || !confianza || !recomienda}>
              Enviar respuestas
            </Button>
          ) : (
            <Typography sx={{ mt: 2, color: "green", fontWeight: 600, textAlign: "center" }}>
              ¡Gracias por tu respuesta!
            </Typography>
          )}
        </form>
      </Alert>
    </Box>
  );
}

export default EncuestaCompra;
