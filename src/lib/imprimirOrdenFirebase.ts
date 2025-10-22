import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FirebaseCartItem {
  cantidad: number;
  id_producto: string;
  imagen: string;
  nombre: string;
  precio: number;
  talla_seleccionada: string;
}

export interface FirebaseOrder {
  id?: string;
  fecha?: { seconds: number } | string;
  estado?: string;
  metodoPago?: string;
  total?: number;
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  cartItems: FirebaseCartItem[];
}

export function imprimirOrdenFirebase(orden: FirebaseOrder) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Orden de Compra", 14, 18);
  doc.setFontSize(12);
  doc.text(`Pedido #${orden.id || "-"}`, 14, 28);
  let fechaTexto = 'No disponible';
  if (orden.fecha) {
    if (typeof orden.fecha === 'string') {
      fechaTexto = orden.fecha;
    } else if (typeof orden.fecha === 'object' && 'seconds' in orden.fecha) {
      fechaTexto = new Date((orden.fecha as { seconds: number }).seconds * 1000).toLocaleDateString('es-ES');
    }
  }
  doc.text(`Fecha: ${fechaTexto}`, 14, 36);
  doc.text(`Estado: ${orden.estado || 'Procesando'}`, 14, 44);
  doc.text(`Método de pago: ${orden.metodoPago || ''}`, 14, 52);
  doc.text(`Total: Q${orden.total?.toLocaleString?.() ?? orden.total ?? ''}`, 14, 60);
  doc.text(`Nombre: ${orden.nombre || ''}`, 14, 68);
  doc.text(`Teléfono: ${orden.telefono || ''}`, 14, 76);
  doc.text(`Email: ${orden.email || ''}`, 14, 84);
  doc.text(`Dirección: ${orden.direccion || ''}`, 14, 92);
  if (orden.notas) doc.text(`Notas: ${orden.notas}`, 14, 100);

  autoTable(doc, {
    startY: 110,
    head: [["Producto", "Talla", "Cantidad", "Precio"]],
    body: (orden.cartItems || []).map((item) => [
      item.nombre,
      item.talla_seleccionada,
      item.cantidad,
      `Q${item.precio?.toLocaleString?.() ?? item.precio}`
    ]),
  });
  doc.save(`orden_${orden.id || 'firebase'}.pdf`);
}
