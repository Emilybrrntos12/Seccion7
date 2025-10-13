import React, { useState, useEffect } from "react";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";

interface Review {
  usuario: string;
  comentario: string;
  puntuacion: number; // 1 a 5
}

interface ProductReviewsProps {
  productId: string;
  user?: { nombre: string; uid: string; email: string };
}

function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return (
    reviews.reduce((acc, r) => acc + r.puntuacion, 0) / reviews.length
  );
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, user }) => {
  const app = useFirebaseApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const firestore = getFirestore(app);
  const q = query(collection(firestore, "reviews"), where("productId", "==", productId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr: Review[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          usuario: data.usuario,
          comentario: data.comentario,
          puntuacion: data.puntuacion,
          id: doc.id
        };
      });
      setReviews(arr);
    });
    return () => unsubscribe();
  }, [app, productId]);

  const avg = getAverageRating(reviews);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || comment.trim() === "") {
      setError("Debes seleccionar una puntuación y escribir un comentario.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const firestore = getFirestore(app);
      await addDoc(collection(firestore, "reviews"), {
  productId,
  usuario: user?.nombre || user?.email || "Anónimo",
  uid: user?.uid || "",
  comentario: comment,
  puntuacion: rating,
  fecha: serverTimestamp(),
      });
      setRating(0);
      setComment("");
    } catch {
      setError("Error al guardar la reseña. Intenta de nuevo.");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center mb-2">
        <span className="font-semibold mr-2">Opiniones de clientes</span>
        <span className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span key={i}>
              {i < Math.round(avg) ? "★" : "☆"}
            </span>
          ))}
        </span>
        <span className="ml-2 text-sm text-gray-600">{avg.toFixed(1)} / 5</span>
        <span className="ml-2 text-xs text-gray-500">({reviews.length} reseñas)</span>
      </div>
      <ul className="space-y-2 mb-4">
  {reviews.map((r: Review, idx: number) => (
          <li key={idx} className="border rounded p-2 bg-gray-50">
            <div className="flex items-center mb-1">
              <span className="font-bold mr-2">{r.usuario}</span>
              <span className="text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < r.puntuacion ? "★" : "☆"}</span>
                ))}
              </span>
            </div>
            <div className="text-sm text-gray-700">{r.comentario}</div>
          </li>
        ))}
      </ul>
  {user && (
        <form onSubmit={handleSubmit} className="border rounded p-3 bg-white">
          <div className="mb-2 font-semibold">Deja tu reseña:</div>
          <div className="flex items-center mb-2">
            <span className="mr-2">Puntuación:</span>
            {[...Array(5)].map((_, i) => (
              <button
                type="button"
                key={i}
                className="text-2xl text-yellow-500 focus:outline-none"
                onClick={() => setRating(i + 1)}
              >
                {i < rating ? "★" : "☆"}
              </button>
            ))}
          </div>
          <textarea
            className="border rounded w-full p-2 mb-2"
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe tu comentario..."
          />
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded"
            disabled={submitting}
          >
            {submitting ? "Enviando..." : "Enviar reseña"}
          </button>
        </form>
      )}
    </div>
  );
};
