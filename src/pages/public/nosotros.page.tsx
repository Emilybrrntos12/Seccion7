import { Box } from "@mui/material";
import Header  from "../../components/ui/header";
import nosotrosImage from '../../assets/nosotros.jpeg';
import hormaImage from '../../assets/horma.jpeg';
import corteImage from '../../assets/corte.jpeg';
import ensambleImage from '../../assets/ensamble.jpeg';
import pulidoImage from '../../assets/pulido.jpeg';

import fundadorImage from '../../assets/fundador.jpeg';
import tabajadorImage from '../../assets/tabajador.jpg';

const artesanos = [
  {
    nombre: 'Nuestra Fundadora y Equipo de Corazón',
    foto: fundadorImage,
    rol: ''
  },
  {
    nombre: 'La tradición del oficio',
    foto: tabajadorImage,
    rol: ''
  }
];

const galeria = [
  {
    src: hormaImage,
    alt: 'Inicio del proceso',
    titulo: 'Inicio del proceso',
    descripcion: 'Todo comienza con la horma, la base sobre la que se moldea el zapato para garantizar la ergonomía y un ajuste perfecto.'
  },
  {
    src: corteImage,
    alt: 'Corte y Selección del Material',
    titulo: 'Corte y Selección del Material',
    descripcion: 'Las piezas de cuero son cortadas y ensambladas a mano. Aquí se define la calidad y el diseño, antes de ser cosidas.'
  },
  {
    src: ensambleImage,
    alt: 'Ensamble y Costura Firme',
    titulo: 'Ensamble y Costura Firme',
    descripcion: 'El calzado toma forma. Cada bota es cosida por manos expertas para asegurar una construcción duradera y resistente.'
  },
  {
    src: pulidoImage,
    alt: 'Pulido y Acabado',
    titulo: 'Pulido y Acabado',
    descripcion: 'Una vez ensambladas, nuestras botas reciben un pulido y acabado para resaltar la belleza natural de la piel.'
  },
];

export const Nosotros: React.FC = () => (
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
      backgroundImage: `url(${nosotrosImage})`,
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
      <Box sx={{ position: 'relative', zIndex: 2, color: '#fff', textAlign: 'center' }}>
        <section className="py-12 px-4 pt-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Nosotros</h1>
            <p className="text-lg text-white mb-8 text-center">
              Bienvenido a <span className="font-semibold">Calzado Santa Catarina Mita</span>, donde la tradición guatemalteca y la innovación se unen para crear calzado artesanal de calidad. Somos una familia de artesanos comprometidos con el arte, la cultura y el desarrollo social de nuestra comunidad.
            </p>
            <div className="rounded-xl p-8 mb-10 bg-white/10 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-2">Nuestra historia</h2>
              <p className="text-white mb-4">
                Nacimos en el corazón de Santa Catarina Mita, Jutiapa, inspirados por generaciones de zapateros que han perfeccionado su oficio con pasión y dedicación. Nuestro proyecto surge del deseo de preservar la herencia artesanal, adaptándola a las tendencias actuales sin perder la esencia cultural. Cada par de zapatos cuenta una historia de esfuerzo, creatividad y orgullo guatemalteco.
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Nuestros valores</h3>
              <ul className="list-disc pl-6 text-white mb-4">
                <li><span className="font-bold">Artesanía:</span> Cada pieza es elaborada a mano por expertos locales.</li>
                <li><span className="font-bold">Calidad:</span> Seleccionamos materiales duraderos y cómodos.</li>
                <li><span className="font-bold">Innovación:</span> Fusionamos técnicas tradicionales con diseños modernos.</li>
                <li><span className="font-bold">Compromiso social:</span> Apoyamos el desarrollo de nuestra comunidad y el comercio justo.</li>
                <li><span className="font-bold">Sostenibilidad:</span> Promovemos procesos responsables y materiales ecológicos.</li>
              </ul>
            </div>
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Nuestro equipo artesanal</h2>
              <div className="flex flex-wrap justify-center gap-8">
                {artesanos.map(a => (
                  <div key={a.nombre} className="w-56 rounded-xl p-4 flex flex-col items-center backdrop-blur-sm bg-white/10 border border-white/20">
                    <img src={a.foto} alt={a.nombre} className="w-28 h-28 object-cover rounded-full mb-3 border-4 border-[#c2a77d]" />
                    <p className="font-bold text-white text-lg">{a.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Galería del proceso artesanal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {galeria.map((img, idx) => (
                  <div key={idx} className="rounded-xl p-2 flex flex-col items-center backdrop-blur-sm bg-white/10 border border-white/20">
                    <img src={img.src} alt={img.alt} className="w-full h-40 object-cover rounded mb-2" />
                    <p className="text-white text-base font-bold text-center">{img.titulo || img.alt}</p>
                    <p className="text-white text-sm text-center">{img.descripcion || img.alt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Box>
    </Box>
  </>
);