import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore/lite";
import { Button, TextField, Box, Typography, Paper, Avatar, CircularProgress } from "@mui/material";
import { getFirestore, collection, getDocs, query, where, addDoc, doc, updateDoc } from "firebase/firestore/lite";
import { useFirebaseApp, useUser } from "reactfire";
import SendIcon from '@mui/icons-material/Send';
import Header2 from "@/components/ui/header-v2";

interface ChatMessage {
  author: "user" | "admin";
  text: string;
  timestamp: { seconds: number } | Date;
  read?: boolean;
}

export const ChatUsuario: React.FC = () => {
  const { data: user } = useUser();
  const [chatId, setChatId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const app = useFirebaseApp();
  const [loading, setLoading] = useState(true);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const q = query(collection(firestore, "conversations"), where("userId", "==", user?.uid));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const userConv = snap.docs[0];
        setChatId(userConv.id);
        const data = userConv.data();
        const messages = Array.isArray(data.messages) ? data.messages : [];
        setChatMessages(messages);
        
        const hasUnreadAdminMessages = messages.some((msg: ChatMessage) => msg.author === 'admin' && !msg.read);
        if (hasUnreadAdminMessages) {
          const updatedMessages = messages.map((msg: ChatMessage) => 
            msg.author === 'admin' ? { ...msg, read: true } : msg
          );
          await updateDoc(doc(firestore, "conversations", userConv.id), {
            messages: updatedMessages
          });
          setChatMessages(updatedMessages);
        }
      } else {
        const newConv = await addDoc(collection(firestore, "conversations"), {
          userId: user?.uid,
          userEmail: user?.email || "",
          messages: [],
          createdAt: Timestamp.now(),
          lastMessageAt: Timestamp.now(),
        });
        setChatId(newConv.id);
        setChatMessages([]);
      }
      setLoading(false);
    };
    if (user?.uid) fetchChat();
  }, [app, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

const formatTimestamp = (timestamp: { seconds: number } | Date | undefined) => {
    if (timestamp && typeof timestamp === 'object') {
      if ('seconds' in timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000).toLocaleTimeString('es-GT', { 
          hour: '2-digit', 
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleTimeString('es-GT', { 
          hour: '2-digit', 
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
      }
    }
    return '';
  };

  return (
    <>
      <Header2 />
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
        padding: { xs: '16px 0', md: '32px 0' }
      }}>

        {/* Contenedor principal del chat */}
        <Box sx={{ 
          maxWidth: 600, 
          margin: '80px auto 0 auto',
          background: '#fff',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          overflow: 'hidden',
          border: '1px solid #e8dcc8'
        }}>
          {/* Header del chat */}
          <Box sx={{
            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
            padding: '24px',
            textAlign: 'center',
            color: '#fff'
          }}>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              Soporte al Cliente
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Estamos aquí para ayudarte
            </Typography>
          </Box>

          {/* Contenedor de mensajes */}
          <Box sx={{ 
            height: '400px', 
            overflowY: 'auto', 
            padding: '20px',
            background: '#fffdf9',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1e9dc'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#8B7355',
              borderRadius: '3px'
            }
          }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', padding: '60px 0' }}>
                <CircularProgress sx={{ color: '#8B7355', mb: 2 }} />
                <Typography color="#8B7355" fontWeight="600">
                  Cargando conversación...
                </Typography>
              </Box>
            ) : chatMessages.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                padding: '60px 0',
                color: '#8B7355'
              }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  ¡Bienvenido!
                </Typography>
                <Typography variant="body2">
                  Inicia la conversación enviando un mensaje
                </Typography>
              </Box>
            ) : (
              <>
                {chatMessages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.author === "user" ? 'flex-end' : 'flex-start',
                      mb: 2,
                      gap: 1
                    }}
                  >
                    {msg.author === "admin" && (
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          background: '#8B7355',
                          fontSize: '14px'
                        }}
                      >
                        A
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: '70%' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          padding: '12px 16px',
                          background: msg.author === "user" 
                            ? 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)' 
                            : '#ffffff',
                          color: msg.author === "user" ? '#fff' : '#5d4037',
                          borderRadius: msg.author === "user" 
                            ? '18px 18px 4px 18px' 
                            : '18px 18px 18px 4px',
                          border: msg.author === "admin" ? '1px solid #e8dcc8' : 'none'
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                          {msg.text}
                        </Typography>
                      </Paper>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          textAlign: msg.author === "user" ? 'right' : 'left',
                          color: '#8B7355',
                          mt: 0.5,
                          px: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        {formatTimestamp(msg.timestamp)}
                      </Typography>
                    </Box>
                    {msg.author === "user" && (
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          background: '#A0522D',
                          fontSize: '14px'
                        }}
                      >
                        T
                      </Avatar>
                    )}
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </Box>

          {/* Input para enviar mensaje */}
          {chatId && (
            <Box sx={{ 
              padding: '20px', 
              background: '#fff',
              borderTop: '1px solid #e8dcc8'
            }}>
              <form onSubmit={async e => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                const firestore = getFirestore(app);
                const ref = doc(firestore, "conversations", chatId);
                const nuevoMsg: ChatMessage = {
                  author: "user",
                  text: newMessage,
                  timestamp: Timestamp.now(),
                  read: false
                };
                await updateDoc(ref, {
                  messages: [...chatMessages, nuevoMsg],
                  lastMessageAt: Timestamp.now()
                });
                setChatMessages(prev => [...prev, nuevoMsg]);
                setNewMessage("");
              }} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <TextField
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  fullWidth
                  multiline
                  maxRows={3}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: '#fffdf9',
                      border: '1px solid #e8dcc8',
                      '&:hover': {
                        borderColor: '#8B7355'
                      },
                      '&.Mui-focused': {
                        borderColor: '#8B7355',
                        boxShadow: '0 0 0 2px rgba(139, 115, 85, 0.1)'
                      }
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={!newMessage.trim()}
                  sx={{
                    minWidth: 'auto',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                      transform: 'scale(1.05)'
                    },
                    '&:disabled': {
                      background: '#e8dcc8'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <SendIcon sx={{ fontSize: 20 }} />
                </Button>
              </form>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}