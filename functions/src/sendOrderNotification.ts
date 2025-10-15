import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import sgMail from "@sendgrid/mail";
import { defineString } from "firebase-functions/params";

admin.initializeApp();

const SENDGRID_API_KEY = defineString("SENDGRID_API_KEY");
const ADMIN_EMAIL = "eb6831196@gmail.com";

export const sendOrderNotification = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data?.data();
  const userEmail = order?.email || "(sin correo)";
  const userName = order?.nombre || "(sin nombre)";
  const orderId = event.params.orderId;
  const total = order?.total || 0;
  const metodoPago = order?.metodoPago || "No especificado";
  const telefono = order?.telefono || "No especificado";
  const direccion = order?.direccion || "No especificada";

  // Inicializar SendGrid con la API key en runtime
  sgMail.setApiKey(SENDGRID_API_KEY.value());

  const msg = {
    to: ADMIN_EMAIL,
    from: {
      email: "notificaciones@ebcatocha.lat",
      name: "Sistema de Pedidos - Seccion7"
    },
    replyTo: "notificaciones@ebcatocha.lat",
    subject: `Pedido #${orderId.substring(0, 8)} - ${userName}`,
    text: `Hola,\n\nSe ha recibido un nuevo pedido en tu tienda.\n\nDetalles del pedido:\n- ID: ${orderId}\n- Cliente: ${userName}\n- Correo: ${userEmail}\n- Teléfono: ${telefono}\n- Dirección: ${direccion}\n- Método de pago: ${metodoPago}\n- Total: Q${total}\n\nRevisa los detalles completos en tu panel de administración.\n\nSaludos,\nSistema de Pedidos`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-top: 0;">Nuevo Pedido Recibido</h2>
          <p style="font-size: 14px; color: #666;">Se ha generado un nuevo pedido en tu tienda.</p>
        </div>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
          <h3 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Detalles del Pedido</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">ID Pedido:</td>
              <td style="padding: 8px 0;">${orderId}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Cliente:</td>
              <td style="padding: 8px 0;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Correo:</td>
              <td style="padding: 8px 0;">${userEmail}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Teléfono:</td>
              <td style="padding: 8px 0;">${telefono}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Dirección:</td>
              <td style="padding: 8px 0;">${direccion}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Método de pago:</td>
              <td style="padding: 8px 0;">${metodoPago}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Total:</td>
              <td style="padding: 8px 0; font-size: 18px; color: #28a745; font-weight: bold;">Q${total}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #007bff; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px;">Revisa los detalles completos en tu panel de administración.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #666; font-size: 12px;">
          <p>Este es un correo automático del sistema de pedidos de Seccion7.</p>
          <p>No respondas a este correo.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log("Correo de notificación enviado al admin");
  } catch (error) {
    console.error("Error al enviar correo de notificación:", error);
  }
  return;
});