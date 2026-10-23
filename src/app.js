const path = require('path');
const express = require('express');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const {
  crearIdentificarSolicitud,
  medirDuracion,
} = require('./middleware/solicitudes');
const { crearControladorReservas } = require('./controladores/reservas');
const { crearRouterReservas } = require('./rutas/reservas');

function crearApp({ configuracion, servicio }) {
  const app = express();
  const controlador = crearControladorReservas(servicio);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('layout', 'layouts/main');

  app.use(morgan(configuracion.formatoRegistro));
  app.use(crearIdentificarSolicitud());
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get('/', controlador.inicio);
  app.get('/estado', controlador.estado);
  app.use('/reservas', crearRouterReservas(controlador));

  app.use((req, res) => {
    res.status(404).render('no-encontrado', { titulo: 'Página No Encontrada' });
  });

  return app;
}

module.exports = { crearApp };
