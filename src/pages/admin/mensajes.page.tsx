
import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore/lite";
import { Button, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Avatar, ListItemAvatar, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore/lite";
import { useFirebaseApp } from "reactfire";

interface ChatMessage {
  author: "user" | "admin";
  text: string;
  timestamp: { seconds: number } | Date;
  read?: boolean;
}

interface Conversation {
  id: string;
  userEmail: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  messages: ChatMessage[];
}

export const MensajesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConvs = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const snap = await getDocs(collection(firestore, "conversations"));
  // (userIds no se usa, se elimina para evitar warning)
      // Buscar los usuarios en la colección users
      const usersSnap = await getDocs(collection(firestore, "users"));
      const usersMap = new Map();
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        usersMap.set(doc.id, {
          nombre: data.nombre || data.email || doc.id,
          photoURL: data.photoURL || data.photo || ''
        });
      });
      const convs: Conversation[] = snap.docs.map(doc => {
        const userData = usersMap.get(doc.data().userId);
        return {
          id: doc.id,
          userEmail: doc.data().userEmail,
          userId: doc.data().userId,
          userName: userData?.nombre || doc.data().userEmail || doc.data().userId,
          userPhoto: userData?.photoURL || '',
          messages: doc.data().messages || []
        };
      });
      setConversations(convs);
      setLoading(false);
    };
    fetchConvs();
  }, [app]);

  // Actualizar mensajes al seleccionar conversación
  useEffect(() => {
    if (selectedConv) {
      setChatMessages(selectedConv.messages);
    } else {
      setChatMessages([]);
    }
  }, [selectedConv]);

  // Scroll automático al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Marcar mensajes del usuario como leídos al abrir conversación
  useEffect(() => {
    if (!selectedConv) return;
    const unread = chatMessages.some(msg => msg.author === "user" && !msg.read);
    if (unread) {
      const firestore = getFirestore(app);
      const updatedMessages = chatMessages.map(msg =>
        msg.author === "user" ? { ...msg, read: true } : msg
      );
      updateDoc(doc(firestore, "conversations", selectedConv.id), {
        messages: updatedMessages
      });
      setChatMessages(updatedMessages);
    }
  }, [selectedConv, chatMessages, app]);

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    const firestore = getFirestore(app);
    const nuevoMsg: ChatMessage = {
      author: "admin",
      text: newMessage,
      timestamp: Timestamp.now(),
      read: false
    };
    await updateDoc(doc(firestore, "conversations", selectedConv.id), {
      messages: [...chatMessages, nuevoMsg],
      lastMessageAt: Timestamp.now()
    });
    setChatMessages(prev => [...prev, nuevoMsg]);
    setNewMessage("");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '32px 0' }}>
      <button
        style={{ position: 'fixed', top: 24, left: 24, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', zIndex: 10 }}
        onClick={() => navigate(-1)}
      >
        ← Regresar
      </button>
      <div style={{ maxWidth: 700, margin: '80px auto 0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1976d2', textAlign: 'center' }}>Mensajes de Usuarios</h2>
        {/* Lista de conversaciones */}
        {loading ? (
          <CircularProgress color="primary" />
        ) : (
          <List sx={{ maxHeight: 200, overflowY: 'auto', mb: 3 }}>
            {conversations.map(conv => {
              const unreadCount = conv.messages.filter(msg => msg.author === "user" && !msg.read).length;
              return (
                <ListItemButton 
                  key={conv.id}
                  selected={selectedConv?.id === conv.id}
                  onClick={() => handleSelectConv(conv)}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={unreadCount} color="error">
                      <Avatar src={conv.userPhoto} alt={conv.userName}>
                        {!conv.userPhoto && (conv.userName?.[0]?.toUpperCase() || 'U')}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={conv.userName || conv.userEmail || conv.userId}
                    secondary={`${conv.messages.length} mensaje${conv.messages.length !== 1 ? 's' : ''}`}
                  />
                </ListItemButton>
              );
            })}
            {conversations.length === 0 && (
              <ListItem><ListItemText primary="No hay conversaciones" /></ListItem>
            )}
          </List>
        )}

        {/* Chat de la conversación seleccionada */}
        {selectedConv && (
          <div style={{ marginBottom: 24 }}>
            {/* Contenedor de mensajes con scroll */}
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              marginBottom: 16,
              padding: '8px',
              border: '1px solid #e0e0e0',
              borderRadius: 8
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#1976d2', padding: '32px 0' }}>No hay mensajes en esta conversación.</div>
              ) : (
                <>
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
                  <div ref={chatEndRef} />
                </>
              )}
            </div>
            {/* Input para enviar mensaje */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
              <TextField
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Escribe tu respuesta..."
                fullWidth
                size="small"
              />
              <Button type="submit" variant="contained" color="primary">Enviar</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
