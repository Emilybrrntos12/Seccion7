import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore/lite';
import { useFirebaseApp, useUser } from 'reactfire';

interface ChatMessage {
  author: 'user' | 'admin';
  text: string;
  timestamp: { seconds: number } | Date;
  read?: boolean;
}

/**
 * Hook para obtener el contador de mensajes no leídos
 * @param isAdmin - Si el usuario es admin o no
 * @returns El número de mensajes no leídos
 */
export const useUnreadMessages = (isAdmin: boolean = false) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: user } = useUser();
  const app = useFirebaseApp();

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }

    const firestore = getFirestore(app);
    
    const fetchUnreadCount = async () => {
      try {
        if (isAdmin) {
          // Admin: contar todos los mensajes de usuarios que no han sido leídos
          const q = query(collection(firestore, 'conversations'));
          const snapshot = await getDocs(q);
          
          let count = 0;
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const messages = (data.messages || []) as ChatMessage[];
            // Contar mensajes de usuarios no leídos
            messages.forEach((msg) => {
              if (msg.author === 'user' && !msg.read) {
                count++;
              }
            });
          });
          setUnreadCount(count);
        } else {
          // Usuario: contar mensajes del admin no leídos en su conversación
          const q = query(
            collection(firestore, 'conversations'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(q);
          
          let count = 0;
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            const messages = (data.messages || []) as ChatMessage[];
            // Contar mensajes del admin no leídos
            messages.forEach((msg) => {
              if (msg.author === 'admin' && !msg.read) {
                count++;
              }
            });
          }
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error al obtener mensajes no leídos:', error);
        setUnreadCount(0);
      }
    };

    // Ejecutar inmediatamente
    fetchUnreadCount();

    // Polling cada 10 segundos
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [app, user, isAdmin]);

  return unreadCount;
};
