const { leerConfiguracion } = require('./configuracion');
const { crearServicioReservas } = require('./servicios/reservas');
const { crearApp } = require('./app');

const RESERVAS_INICIALES = [
  {
    id: 1,
    estudiante: 'Ana Gómez',
    email: 'ana@ejemplo.com',
    sala: 'Sala Norte',
    fecha: '2026-09-25',
    turno: 'Mañana',
    personas: 3,
  },
  {
    id: 2,
    estudiante: 'Carlos Pérez',
    email: 'carlos@ejemplo.com',
    sala: 'Sala Sur',
    fecha: '2026-09-25',
    turno: 'Tarde',
    personas: 2,
  },
  {
    id: 3,
    estudiante: 'Lucía Fernández',
    email: 'lucia@ejemplo.com',
    sala: 'Sala Multimedia',
    fecha: '2026-09-26',
    turno: 'Noche',
    personas: 6,
  },
  {
    id: 4,
    estudiante: 'Martín Rodríguez',
    email: 'martin@ejemplo.com',
    sala: 'Sala Norte',
    fecha: '2026-09-27',
    turno: 'Tarde',
    personas: 4,
  },
];

function iniciar() {
  let configuracion;

  try {
    configuracion = leerConfiguracion();
  } catch (error) {
    console.error(`Error de configuración: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const servicio = crearServicioReservas(RESERVAS_INICIALES);
  const app = crearApp({ configuracion, servicio });

  app.listen(configuracion.puerto, () => {
    console.log(
      `Servidor corriendo en http://localhost:${configuracion.puerto} (${configuracion.entorno})`,
    );
  });
}

iniciar();
