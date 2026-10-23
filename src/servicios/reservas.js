// Servicio de reservas en memoria. No conoce req, res, EJS ni códigos HTTP.
function crearServicioReservas(datosIniciales) {
  const reservas = datosIniciales.map((reserva) => ({ ...reserva }));

  return {
    listar() {
      return [...reservas];
    },

    buscarPorId(id) {
      return reservas.find((reserva) => reserva.id === id);
    },

    contar() {
      return reservas.length;
    },

    crear(datos) {
      const nuevoId =
        reservas.length > 0
          ? Math.max(...reservas.map((reserva) => reserva.id)) + 1
          : 1;
      const nuevaReserva = { id: nuevoId, ...datos };

      reservas.push(nuevaReserva);
      return nuevaReserva;
    },
  };
}

module.exports = { crearServicioReservas };
