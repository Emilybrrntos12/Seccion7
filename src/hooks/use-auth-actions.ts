import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import type { AuthError } from "firebase/auth";
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
        // photoURL: data.photoURL ? URL.createObjectURL(data.photoURL) : null, // Uncomment if photoURL is used
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName,
        });
      }

      // Forzar la recarga del usuario para sincronizar con ReactFire
      // Se utiliza en videos siguientes
      //await currentUser.user.reload();

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

  const loginWithGoogle = async (): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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

  const logout = async (): Promise<AuthActionResult> => {
    setLoading(true);
    try {
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