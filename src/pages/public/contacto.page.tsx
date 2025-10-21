import React, { useState } from "react";
import { useUser } from "reactfire";
import Header from "../../components/ui/header";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getFirestore, collection, addDoc } from "firebase/firestore/lite";
import { useFirebaseApp } from "reactfire";

const MySwal = withReactContent(Swal);

export const Contacto: React.FC = () => {
  const app = useFirebaseApp();
  const firestore = getFirestore(app);
  const { data: user } = useUser();
  const [form, setForm] = useState({ nombre: "", email: user?.email ?? "", asunto: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  // Actualiza el email si el usuario cambia
  React.useEffect(() => {
    if (user?.email) {
      setForm(f => ({ ...f, email: user.email ?? "" }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    try {
      await addDoc(collection(firestore, "contact_messages"), {
        nombre: form.nombre,
        email: form.email,
        asunto: form.asunto,
        mensaje: form.mensaje,
        fecha: new Date(),
        uid: user?.uid ?? null
      });
      await MySwal.fire({
        icon: "success",
        title: "¡Mensaje enviado!",
        text: "Gracias por contactarnos. Te responderemos pronto.",
        confirmButtonColor: "#8d6748"
      });
      setForm({ nombre: "", email: user?.email ?? "", asunto: "", mensaje: "" });
    } catch {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar el mensaje. Intenta de nuevo.",
        confirmButtonColor: "#8d6748"
      });
    }
    setEnviado(false);
  };

  return (
    <>
      <Header />
      <section className="bg-[#f5ecd7] py-12 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto pt-20">
          <h1 className="text-3xl md:text-4xl font-bold text-[#8d6748] mb-4 text-center">Contacto</h1>
          <p className="text-lg text-[#5d4037] mb-8 text-center">
            ¿Tienes dudas, comentarios o quieres conocer más sobre <span className="font-semibold">Calzado Santa Catarina Mita</span>? Escríbenos y te responderemos pronto.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Formulario */}
            <form className="bg-white rounded-xl shadow-md p-8 flex flex-col gap-6" onSubmit={handleSubmit}>
              {!user && (
                <div className="mb-4 text-center text-[#8d6748] font-semibold">
                  Debes iniciar sesión para enviar el formulario.
                </div>
              )}
              <div>
                <label className="block text-[#8d6748] font-semibold mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c2a77d]"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-[#8d6748] font-semibold mb-2">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c2a77d]"
                  placeholder="tucorreo@ejemplo.com"
                  disabled={!!user}
                  readOnly={!!user}
                />
              </div>
              <div>
                <label className="block text-[#8d6748] font-semibold mb-2">Asunto</label>
                <input
                  type="text"
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c2a77d]"
                  placeholder="¿Sobre qué tema quieres consultar?"
                />
              </div>
              <div>
                <label className="block text-[#8d6748] font-semibold mb-2">Mensaje</label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c2a77d]"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>
              <button
                type="submit"
                className="bg-[#8d6748] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#5d4037] transition-colors"
                disabled={enviado || !user}
              >
                {enviado ? "Enviando..." : "Enviar mensaje"}
              </button>
              <div className="flex gap-4 justify-center mt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-[#8d6748] hover:bg-[#5d4037] text-white rounded-full p-3 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"></path></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-[#8d6748] hover:bg-[#5d4037] text-white rounded-full p-3 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0z"/><circle cx="12" cy="12" r="3.5"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>
                </a>
                <a href="https://wa.me/50255551234" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-3 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.77 11.77 0 0 0 12.07.25C6.13.25 1.07 5.31 1.07 11.25c0 2.01.53 3.97 1.54 5.7L.25 23.75l7.01-2.29a11.8 11.8 0 0 0 4.81 1.04c5.94 0 11-5.06 11-11.01 0-2.97-1.16-5.77-3.3-7.97zm-8.45 19.02c-1.56 0-3.09-.3-4.53-.89l-.32-.13-4.16 1.36 1.36-4.16-.13-.32c-.59-1.44-.89-2.97-.89-4.53 0-5.07 4.13-9.2 9.2-9.2 2.46 0 4.77.96 6.51 2.7a9.18 9.18 0 0 1 2.69 6.5c0 5.07-4.13 9.21-9.2 9.21zm5.13-6.18c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.07 1.05-1.07 2.56 0 1.5 1.09 2.95 1.24 3.16.15.21 2.15 3.29 5.23 4.47.73.25 1.3.4 1.75.51.73.19 1.39.16 1.91.1.58-.07 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/></svg>
                </a>
              </div>
            </form>
            {/* Información de contacto y mapa */}
            <div className="flex flex-col gap-6 justify-center">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-xl font-bold mb-2 text-[#8d6748]">Información de contacto</h2>
                <p className="mb-1 text-[#5d4037]">Correo: <a href="mailto:info@santacatarinamita.com" className="underline text-[#8d6748]">info@santacatarinamita.com</a></p>
                <p className="mb-1 text-[#5d4037]">Teléfono: <a href="tel:+50255551234" className="underline text-[#8d6748]">+502 5555 1234</a></p>
                <p className="mb-1 text-[#5d4037]">Dirección: Santa Catarina Mita, Jutiapa, Guatemala</p>
                <p className="mb-1 text-[#5d4037]">Horario: Lunes a Sábado, 8:00am - 6:00pm</p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-md">
                <iframe
                  title="Ubicación Calzado Santa Catarina Mita"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3870.234624735812!2d-89.8822226857257!3d14.56666698981359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f62e7e2e2e2e2e3%3A0x123456789abcdef!2sSanta%20Catarina%20Mita%2C%20Jutiapa%2C%20Guatemala!5e0!3m2!1ses!2sgt!4v1697040000000!5m2!1ses!2sgt"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
