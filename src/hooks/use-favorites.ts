import React from "react";
import { useState, useEffect } from "react";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, query, where } from "firebase/firestore/lite";
import { useFirebaseApp } from "reactfire";
import { useUser } from "reactfire";

export const useFavorites = () => {
  const app = useFirebaseApp();
  const { data: user } = useUser();
  const [favorites, setFavorites] = useState<string[]>([]); // IDs de productos favoritos

  const fetchFavorites = React.useCallback(async () => {
    if (!user?.uid) return setFavorites([]);
    const firestore = getFirestore(app);
    const favCol = collection(firestore, "favorites");
    const q = query(favCol, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    setFavorites(snapshot.docs.map(doc => doc.data().productId));
  }, [app, user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (productId: string) => {
    if (!user?.uid) return;
    const firestore = getFirestore(app);
    const favDoc = doc(firestore, "favorites", `${user.uid}_${productId}`);
    await setDoc(favDoc, { userId: user.uid, productId });
    await fetchFavorites(); // Actualiza favoritos desde Firestore
  };

  const removeFavorite = async (productId: string) => {
    if (!user?.uid) return;
    const firestore = getFirestore(app);
    const favDoc = doc(firestore, "favorites", `${user.uid}_${productId}`);
    await deleteDoc(favDoc);
    await fetchFavorites(); // Actualiza favoritos desde Firestore
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
