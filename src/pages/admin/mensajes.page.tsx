import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore/lite";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore/lite";
import { useFirebaseApp } from "reactfire";

interface ChatMessage {
  author: "user" | "admin";
  text: string;
  timestamp: { seconds: number } | Date;
  read?: boolean;
}

export const MensajesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [chatId, setChatId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const app = useFirebaseApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar la primera conversación (puedes adaptar para seleccionar por usuario)
    const fetchChat = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const snap = await getDocs(collection(firestore, "conversations"));
      if (snap.docs.length > 0) {
        const convDoc = snap.docs[0];
        setChatId(convDoc.id);
        const data = convDoc.data();
        const messages = Array.isArray(data.messages) ? data.messages : [];
        setChatMessages(messages);
        
        // Marcar mensajes del usuario como leídos
        const hasUnreadUserMessages = messages.some((msg: ChatMessage) => msg.author === 'user' && !msg.read);
        if (hasUnreadUserMessages) {
          const updatedMessages = messages.map((msg: ChatMessage) => 
            msg.author === 'user' ? { ...msg, read: true } : msg
          );
          await updateDoc(doc(firestore, "conversations", convDoc.id), {
            messages: updatedMessages
          });
          setChatMessages(updatedMessages);
        }
      }
      setLoading(false);
    };
    fetchChat();
  }, [app]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '32px 0' }}>
      <button
        style={{ position: 'fixed', top: 24, left: 24, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}
        onClick={() => navigate(-1)}
      >
        ← Regresar
      </button>
      <div style={{ maxWidth: 500, margin: '80px auto 0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1976d2', textAlign: 'center' }}>Chat de Mensaje</h2>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#1976d2', padding: '32px 0' }}>Cargando chat...</div>
        ) : chatMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#1976d2', padding: '32px 0' }}>No hay mensajes en esta conversación.</div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                background: msg.author === "admin" ? '#e3f2fd' : '#f5f5f5',
                color: '#333',
                borderRadius: 8,
                padding: '10px 16px',
                marginBottom: 10,
                textAlign: msg.author === "admin" ? 'right' : 'left'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {msg.author === "admin" ? "Admin" : "Usuario"}
                </div>
                <div>{msg.text}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                  {(() => {
                    if (msg.timestamp && typeof msg.timestamp === 'object') {
                      if ('seconds' in msg.timestamp && typeof msg.timestamp.seconds === 'number') {
                        return new Date(msg.timestamp.seconds * 1000).toLocaleString();
                      }
                      if (msg.timestamp instanceof Date) {
                        return msg.timestamp.toLocaleString();
                      }
                    }
                    return '';
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Input para enviar mensaje */}
        {chatId && (
          <form onSubmit={async e => {
            e.preventDefault();
            if (!newMessage.trim()) return;
            const { getFirestore, doc, updateDoc } = await import("firebase/firestore/lite");
            const firestore = getFirestore(app);
            const ref = doc(firestore, "conversations", chatId);
            const nuevoMsg: ChatMessage = {
              author: "admin",
              text: newMessage,
              timestamp: Timestamp.now(),
              read: false
            };
            await updateDoc(ref, {
              messages: [...chatMessages, nuevoMsg]
            });
            setChatMessages(prev => [...prev, nuevoMsg]);
            setNewMessage("");
          }} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <TextField
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Escribe tu respuesta..."
              fullWidth
              size="small"
            />
            <Button type="submit" variant="contained" color="primary">Enviar</Button>
          </form>
        )}
      </div>
    </div>
  );
}
