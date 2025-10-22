import React, { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore/lite";
import { 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  CircularProgress, 
  Avatar, 
  ListItemAvatar, 
  Badge,
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore/lite";
import { useFirebaseApp } from "reactfire";
import { ArrowBack, Send } from "@mui/icons-material";

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

  // Paleta de colores tierra
  const palette = {
    primary: "#8B7355",
    secondary: "#A0522D",
    background: "#fffdf9",
    light: "#e8dcc8",
    dark: "#5d4037",
    accent: "#c2a77d"
  };

  useEffect(() => {
    const fetchConvs = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const snap = await getDocs(collection(firestore, "conversations"));
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
      paddingTop: '80px',
      py: 4
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        {/* Botón de regreso */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            background: palette.primary,
            color: 'white',
            borderRadius: 3,
            padding: '10px 20px',
            fontWeight: 600,
            mb: 3,
            '&:hover': {
              background: palette.secondary,
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(139, 115, 85, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Regresar
        </Button>

        <Card sx={{ 
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          border: '1px solid #e8dcc8',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)', 
              color: 'white', 
              p: 3,
              textAlign: 'center'
            }}>
              <Typography variant="h4" fontWeight="700">
                Centro de Mensajes
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Atención al cliente - Soporte de usuarios
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', height: '600px' }}>
              {/* Lista de conversaciones */}
              <Box sx={{ 
                width: '350px', 
                borderRight: '1px solid', 
                borderColor: palette.light,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: palette.light }}>
                  <Typography variant="h6" fontWeight="600" sx={{ color: palette.dark }}>
                    Conversaciones
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.primary }}>
                    {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <CircularProgress sx={{ color: palette.primary }} />
                  </Box>
                ) : (
                  <List sx={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(conv => {
                      const unreadCount = conv.messages.filter(msg => msg.author === "user" && !msg.read).length;
                      const lastMessage = conv.messages[conv.messages.length - 1];
                      return (
                        <ListItemButton 
                          key={conv.id}
                          selected={selectedConv?.id === conv.id}
                          onClick={() => handleSelectConv(conv)}
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: palette.light,
                            '&.Mui-selected': {
                              background: palette.light,
                              '&:hover': {
                                background: palette.light
                              }
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Badge badgeContent={unreadCount} color="error">
                              <Avatar 
                                src={conv.userPhoto} 
                                alt={conv.userName}
                                sx={{
                                  background: palette.primary,
                                  color: 'white'
                                }}
                              >
                                {!conv.userPhoto && (conv.userName?.[0]?.toUpperCase() || 'U')}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography fontWeight="600" sx={{ color: palette.dark }}>
                                {conv.userName || conv.userEmail || conv.userId}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: palette.primary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '200px'
                                  }}
                                >
                                  {lastMessage?.text || 'Sin mensajes'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: palette.primary, opacity: 0.7 }}>
                                  {conv.messages.length} mensaje{conv.messages.length !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      );
                    })}
                    {conversations.length === 0 && (
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Typography textAlign="center" sx={{ color: palette.primary }}>
                              No hay conversaciones activas
                            </Typography>
                          } 
                        />
                      </ListItem>
                    )}
                  </List>
                )}
              </Box>

              {/* Área de chat */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedConv ? (
                  <>
                    {/* Header del chat */}
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: '1px solid', 
                      borderColor: palette.light,
                      background: palette.background
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={selectedConv.userPhoto} 
                          sx={{
                            background: palette.primary,
                            color: 'white'
                          }}
                        >
                          {!selectedConv.userPhoto && (selectedConv.userName?.[0]?.toUpperCase() || 'U')}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ color: palette.dark }}>
                            {selectedConv.userName || selectedConv.userEmail || selectedConv.userId}
                          </Typography>
                          <Typography variant="body2" sx={{ color: palette.primary }}>
                            {selectedConv.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Mensajes */}
                    <Box sx={{ 
                      flex: 1, 
                      overflowY: 'auto', 
                      p: 2,
                      background: palette.background,
                      '&::-webkit-scrollbar': {
                        width: '6px'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: palette.light
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: palette.primary,
                        borderRadius: '3px'
                      }
                    }}>
                      {chatMessages.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          color: palette.primary
                        }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                            No hay mensajes
                          </Typography>
                          <Typography variant="body2">
                            Inicia la conversación enviando un mensaje
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {chatMessages.map((msg, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                justifyContent: msg.author === "admin" ? 'flex-end' : 'flex-start',
                                gap: 1
                              }}
                            >
                              <Paper
                                elevation={1}
                                sx={{
                                  padding: '12px 16px',
                                  maxWidth: '70%',
                                  background: msg.author === "admin" 
                                    ? 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)' 
                                    : '#ffffff',
                                  color: msg.author === "admin" ? '#fff' : palette.dark,
                                  borderRadius: msg.author === "admin" 
                                    ? '18px 18px 4px 18px' 
                                    : '18px 18px 18px 4px',
                                  border: msg.author === "user" ? `1px solid ${palette.light}` : 'none'
                                }}
                              >
                                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                                  {msg.text}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block',
                                    textAlign: msg.author === "admin" ? 'right' : 'left',
                                    color: msg.author === "admin" ? 'rgba(255,255,255,0.8)' : palette.primary,
                                    mt: 0.5,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {formatTimestamp(msg.timestamp)}
                                </Typography>
                              </Paper>
                            </Box>
                          ))}
                          <div ref={chatEndRef} />
                        </Box>
                      )}
                    </Box>

                    {/* Input de mensaje */}
                    <Box sx={{ 
                      p: 2, 
                      borderTop: '1px solid', 
                      borderColor: palette.light,
                      background: 'white'
                    }}>
                      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <TextField
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          fullWidth
                          multiline
                          maxRows={3}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: palette.background,
                              border: '1px solid #e8dcc8',
                              '&:hover': {
                                borderColor: palette.primary
                              },
                              '&.Mui-focused': {
                                borderColor: palette.primary,
                                boxShadow: '0 0 0 2px rgba(139, 115, 85, 0.1)'
                              }
                            }
                          }}
                        />
                        <IconButton 
                          type="submit"
                          disabled={!newMessage.trim()}
                          sx={{
                            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                            color: 'white',
                            borderRadius: 2,
                            width: 48,
                            height: 48,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                              transform: 'scale(1.05)'
                            },
                            '&:disabled': {
                              background: palette.light
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Send sx={{ fontSize: 20 }} />
                        </IconButton>
                      </form>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: palette.primary, mb: 2 }}>
                        Selecciona una conversación
                      </Typography>
                      <Typography variant="body2" sx={{ color: palette.dark, opacity: 0.8 }}>
                        Elige una conversación de la lista para comenzar a chatear
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}