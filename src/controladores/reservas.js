// Controlador: lee parámetros, consulta al servicio y responde (vista, JSON, 404, redirección).
function crearControladorReservas(servicio) {
  return {
    inicio(req, res) {
      res.render('inicio', { titulo: 'Inicio - Gestión de Salas' });
    },

    estado(req, res) {
      res.json({
        servicio: 'activo',
        cantidadReservas: servicio.contar(),
        solicitudId: res.locals.solicitudId,
      });
    },

    listar(req, res) {
      res.render('reservas/lista', {
        titulo: 'Listado de Reservas',
        reservas: servicio.listar(),
      });
    },

    formulario(req, res) {
      res.render('reservas/nueva', {
        titulo: 'Nueva Reserva',
        errores: null,
        valores: {},
      });
    },

    detalle(req, res) {
      const idBusqueda = parseInt(req.params.id, 10);
      const reserva = servicio.buscarPorId(idBusqueda);

      if (!reserva) {
        res
          .status(404)
          .render('no-encontrado', { titulo: 'Reserva No Encontrada' });
        return;
      }

      res.render('reservas/detalle', {
        titulo: `Detalle Reserva #${reserva.id}`,
        reserva,
      });
    },

    crear(req, res) {
      servicio.crear(req.reservaValidada);
      res.redirect('/reservas');
    },
  };
}

module.exports = { crearControladorReservas };
