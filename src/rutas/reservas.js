const express = require('express');
const {
  prepararSeccionReservas,
  validarReserva,
} = require('../middleware/reservas');

// Los caminos son relativos al punto de montaje (/reservas), que se define en app.js.
function crearRouterReservas(controlador) {
  const router = express.Router();

  router.use(prepararSeccionReservas);

  router.get('/', controlador.listar);
  // /nueva debe registrarse antes de /:id para no ser capturada como un id.
  router.get('/nueva', controlador.formulario);
  router.get('/:id', controlador.detalle);
  router.post('/', validarReserva, controlador.crear);

  return router;
}

module.exports = { crearRouterReservas };
