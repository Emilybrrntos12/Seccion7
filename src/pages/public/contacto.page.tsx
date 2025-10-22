import React from "react";
import Header from "../../components/ui/header";
import { Box } from "@mui/material";
import bota2Image from '../../assets/bota2.jpg';

export const Contacto: React.FC = () => {


  return (
    <>
      <Header />
      <Box sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${bota2Image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Filtro negro con degradado */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1,
        }} />
        <section className="py-12 px-4 min-h-screen" style={{ position: 'relative', zIndex: 2 }}>
          <div className="max-w-4xl mx-auto pt-15">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Contacto</h1>
            <p className="text-lg text-white mb-8 text-center">
              ¿Tienes dudas, comentarios o quieres conocer más sobre <span className="font-semibold">Calzado Santa Catarina Mita</span>? Contáctanos a través de nuestros canales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Información de contacto */}
              <div className="flex flex-col gap-6">
                <div className="rounded-xl p-8  bg-white/10 border border-white/20">
                  <h2 className="text-xl font-bold mb-4 text-white">Información de contacto</h2>
                  <div className="space-y-3">
                    <p className="text-white flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <a href="mailto:info@santacatarinamita.com" className="underline hover:text-[#c2a77d] transition-colors">
                        eb6831196@gmail.com
                      </a>
                    </p>
                    <p className="text-white flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      <a href="tel:+50255551234" className="underline hover:text-[#c2a77d] transition-colors">
                        +502 5555 1234
                      </a>
                    </p>
                    <p className="text-white flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Santa Catarina Mita, Jutiapa, Guatemala
                    </p>
                    <p className="text-white flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      Lunes a Sábado, 8:00am - 6:00pm
                    </p>
                  </div>
                </div>
                
                {/* Redes sociales */}
                <div className="rounded-xl p-8 bg-white/10 border border-white/20">
                  <h2 className="text-xl font-bold mb-4 text-white">Síguenos en redes sociales</h2>
                  <div className="flex gap-4 justify-center">
                    <a href="https://www.facebook.com/wagneradonai" target="_blank" rel="noopener noreferrer" className="bg-[#8d6748] hover:bg-[#5d4037] text-white rounded-full p-3 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/>
                      </svg>
                    </a>
                    <a href="https://wa.me/50255551234" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-3 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.52 3.48A11.77 11.77 0 0 0 12.07.25C6.13.25 1.07 5.31 1.07 11.25c0 2.01.53 3.97 1.54 5.7L.25 23.75l7.01-2.29a11.8 11.8 0 0 0 4.81 1.04c5.94 0 11-5.06 11-11.01 0-2.97-1.16-5.77-3.3-7.97zm-8.45 19.02c-1.56 0-3.09-.3-4.53-.89l-.32-.13-4.16 1.36 1.36-4.16-.13-.32c-.59-1.44-.89-2.97-.89-4.53 0-5.07 4.13-9.2 9.2-9.2 2.46 0 4.77.96 6.51 2.7a9.18 9.18 0 0 1 2.69 6.5c0 5.07-4.13 9.21-9.2 9.21zm5.13-6.18c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.07 1.05-1.07 2.56 0 1.5 1.09 2.95 1.24 3.16.15.21 2.15 3.29 5.23 4.47.73.25 1.3.4 1.75.51.73.19 1.39.16 1.91.1.58-.07 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="flex flex-col gap-6">
                <div className="rounded-xl overflow-hidden shadow-md  bg-white/10 border border-white/20 p-8">
                  <Box sx={{ position: 'relative', zIndex: 2, color: '#fff', textAlign: 'center' }}>
                    <h1>Contacto</h1>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                        Dirección: <a href="https://maps.app.goo.gl/xAXfBPCMBiXot5QT9" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>Ver en Google Maps</a>
                      </p>
                    </Box>
                    {/* Mapa de Google */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <iframe
                        src="https://maps.google.com/maps?q=21.505833,-104.895833&z=15&output=embed"
                        width="350"
                        height="250"
                        style={{ border: 0, borderRadius: 12 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación Google Maps"
                      />
                    </Box>
                  </Box>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Box>
    </>
  );
}