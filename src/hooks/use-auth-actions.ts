import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import type { AuthError, User } from "firebase/auth";
import { useState } from "react";

import { useAuth } from "reactfire";

interface AuthActionResult {
  success: boolean;
  error: AuthError | null;
}

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const login = async (data: {
    email: string;
    password: string;
  }): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    displayName: string;
    /* photoURL?: File */
  }): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName,
        });
        // Crear documento de perfil en Firestore
        try {
          const { getFirestore, doc, setDoc } = await import('firebase/firestore/lite');
          const firestore = getFirestore();
          await setDoc(doc(firestore, "users", userCredential.user.uid), {
            nombre: data.displayName,
            email: data.email,
            foto: userCredential.user.photoURL ?? "",
            telefono: "",
            aniosNegocio: "",
            historia: "",
            estado: "activo",
            ultimaVezEnLinea: new Date().toISOString()
          });
        } catch (firestoreError) {
          console.error("Error creando perfil en Firestore:", firestoreError);
        }
      }
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError,
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthActionResult & { user?: User }> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      try {
        // Intentar popup primero (mejor experiencia en escritorio)
        const userCredential = await signInWithPopup(auth, provider);
        // Crear documento en Firestore si no existe
        if (userCredential.user) {
          try {
            const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore/lite');
            const firestore = getFirestore();
            const userRef = doc(firestore, "users", userCredential.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                nombre: userCredential.user.displayName ?? "",
                email: userCredential.user.email ?? "",
                foto: userCredential.user.photoURL ?? "",
                telefono: "",
                aniosNegocio: "",
                historia: "",
                estado: "activo",
                ultimaVezEnLinea: new Date().toISOString()
              });
            } else {
              // Si ya existe, actualizar estado y última vez en línea
              const { updateDoc } = await import('firebase/firestore/lite');
              await updateDoc(userRef, {
                estado: "activo",
                ultimaVezEnLinea: new Date().toISOString()
              });
            }
          } catch (firestoreError) {
            console.error("Error creando perfil en Firestore (Google):", firestoreError);
          }
        }
        return {
          success: true,
          error: null,
          user: userCredential.user,
        };
      } catch {
        // Si el popup es bloqueado o no está disponible (móvil), fallback a redirect
        await import("firebase/auth").then(({ signInWithRedirect }) =>
          signInWithRedirect(auth, provider)
        );
        // No hay user en redirect inmediato
        return {
          success: true,
          error: null,
        };
      }
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      // Actualizar estado a inactivo antes de cerrar sesión
      const user = auth.currentUser;
      if (user) {
        try {
          const { getFirestore, doc, updateDoc } = await import('firebase/firestore/lite');
          const firestore = getFirestore();
          const userRef = doc(firestore, "users", user.uid);
          await updateDoc(userRef, {
            estado: "inactivo",
            ultimaVezEnLinea: new Date().toISOString()
          });
        } catch (firestoreError) {
          console.error("Error actualizando estado en Firestore (logout):", firestoreError);
        }
      }
      await signOut(auth);
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    login,
    register,
    loginWithGoogle,
    logout
  };
};