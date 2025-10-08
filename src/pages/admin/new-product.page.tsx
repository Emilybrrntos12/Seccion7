import { useState, useEffect } from "react";
import { useAuth, useFirebaseApp } from "reactfire";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import axios from "axios";
import { toast } from "sonner";

const NewProductPage = () => {
  const auth = useAuth();
  const app = useFirebaseApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return setIsAdmin(false);
      const firestore = getFirestore(app);
      const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
      setIsAdmin(adminDoc.exists());
    };
    checkAdmin();
  }, [auth, app]);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfqhhvota/image/upload";
  const CLOUDINARY_PRESET = "ecommerce_unsigned";

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("No tienes permisos para crear productos.");
      return;
    }
    if (!title || !description || !price || !image) {
      toast.error("Completa todos los campos y selecciona una imagen.");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No autenticado");
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }
      const firestore = getFirestore(app);
      const productsCol = collection(firestore, "products");
      const docData = {
        title,
        description,
        price: parseFloat(price),
        sizes,
        images: [imageUrl],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        stock: 0
      };
      await addDoc(productsCol, docData);
      toast.success("Producto creado exitosamente");
      setTitle("");
      setDescription("");
      setPrice("");
      setSizes([]);
      setImage(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(`Error: ${e?.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Nuevo producto</h2>
      {!isAdmin ? (
        <div className="text-red-500">No tienes permisos para crear productos.</div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <textarea
            placeholder="Descripción"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Precio"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2"
          />
          <select
            multiple
            value={sizes}
            onChange={e => setSizes(Array.from(e.target.selectedOptions, opt => opt.value))}
            className="border rounded px-3 py-2"
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
          <button
            type="submit"
            className="bg-primary text-white rounded py-2"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear producto"}
          </button>
        </form>
      )}
    </div>
  );
};

export default NewProductPage;