import jsPDF from "jspdf";

// Extensión de jsPDF para incluir lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY?: number;
  };
}
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
  const doc: jsPDFWithAutoTable = new jsPDF();
  
  doc.setFont("helvetica");

  // --- Encabezado y título ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Orden de Compra", 14, 22);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const orderId = orden.id ? orden.id : 'N/A';
  doc.text(`Número de pedido: ${orderId}`, 14, 35);
  let fechaTexto = 'No disponible';
  if (orden.fecha) {
    if (typeof orden.fecha === 'string') {
      fechaTexto = orden.fecha;
    } else if (typeof orden.fecha === 'object' && 'seconds' in orden.fecha) {
      fechaTexto = new Date((orden.fecha as { seconds: number }).seconds * 1000).toLocaleDateString('es-GT');
    }
  }
  doc.text(`Fecha: ${fechaTexto}`, 14, 42);
  doc.setFont("helvetica", "bold");
  doc.text("Información del Cliente:", 14, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${orden.nombre || ''}`, 14, 62);
  doc.text(`Dirección: ${orden.direccion || ''}`, 14, 69);
  doc.text(`Teléfono: ${orden.telefono || ''}`, 14, 76);
  doc.text(`Email: ${orden.email || 'N/A'}`, 14, 83);
  doc.text(`Método de pago: ${orden.metodoPago === 'efectivo' ? 'Efectivo contra entrega' : 'Transferencia bancaria'}`, 14, 90);
  doc.setFont("helvetica", "bold");
  doc.text("Productos:", 14, 103);
  // --- Tabla de productos ---
  autoTable(doc, {
    startY: 107,
    head: [["Producto", "Talla", "Cantidad", "Precio Unitario", "Subtotal"]],
    body: (orden.cartItems || []).map((item) => [
      item.nombre,
      item.talla_seleccionada,
      item.cantidad.toString(),
      `Q${item.precio?.toLocaleString()}`,
      `Q${(item.precio * item.cantidad).toLocaleString()}`
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: [139, 115, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 }
    }
  });
  const total = orden.cartItems?.reduce((acc, item) => acc + (item.precio * item.cantidad), 0) || 0;
  const finalY = doc.lastAutoTable?.finalY || 130;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: Q${total.toLocaleString()}`, 14, finalY + 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Gracias por su compra. Te contactaremos pronto para coordinar la entrega.", 14, finalY + 30);
  // Guardar PDF
  const fileName = `orden_${orden.id || 'scm'}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

// Función auxiliar para colores de estado
