const SALAS_PERMITIDAS = ['Sala Norte', 'Sala Sur', 'Sala Multimedia'];
const TURNOS_PERMITIDOS = ['Mañana', 'Tarde', 'Noche'];

function prepararSeccionReservas(req, res, next) {
  res.locals.seccion = 'Reservas de salas';
  next();
}

function normalizarTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function convertirPersonas(valor) {
  if (typeof valor === 'number') {
    return valor;
  }
  if (typeof valor === 'string' && valor.trim() !== '') {
    return Number(valor);
  }
  return NaN;
}

function validarReserva(req, res, next) {
  const estudiante = normalizarTexto(req.body.estudiante);
  const email = normalizarTexto(req.body.email);
  const sala = normalizarTexto(req.body.sala);
  const fecha = normalizarTexto(req.body.fecha);
  const turno = normalizarTexto(req.body.turno);
  const numPersonas = convertirPersonas(req.body.personas);

  const errores = [];

  if (!estudiante) {
    errores.push('El nombre del estudiante es obligatorio.');
  }
  if (!email || !email.includes('@')) {
    errores.push("El email debe ser válido y contener un '@'.");
  }
  if (!SALAS_PERMITIDAS.includes(sala)) {
    errores.push('La sala seleccionada no está permitida.');
  }
  if (!fecha) {
    errores.push('La fecha es obligatoria.');
  }
  if (!TURNOS_PERMITIDOS.includes(turno)) {
    errores.push('El turno seleccionado no es válido.');
  }
  if (!Number.isInteger(numPersonas) || numPersonas < 1 || numPersonas > 6) {
    errores.push(
      'La cantidad de personas debe ser un número entero entre 1 y 6.',
    );
  }

  if (errores.length > 0) {
    res.status(400).render('reservas/nueva', {
      titulo: 'Nueva Reserva - Error en validación',
      errores,
      valores: req.body,
    });
    return; // Responde y no llama a next().
  }

  req.reservaValidada = {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas: numPersonas,
  };
  next();
}

module.exports = { prepararSeccionReservas, validarReserva };
