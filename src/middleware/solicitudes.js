function crearIdentificarSolicitud() {
  let contadorSolicitudes = 0;

  return function identificarSolicitud(req, res, next) {
    contadorSolicitudes++;
    res.locals.solicitudId = `BIB-${String(contadorSolicitudes).padStart(4, '0')}`;
    next();
  };
}

function medirDuracion(req, res, next) {
  const tiempoInicio = process.hrtime();

  res.on('finish', () => {
    const diferencia = process.hrtime(tiempoInicio);
    const milisegundos = (diferencia[0] * 1000 + diferencia[1] / 1e6).toFixed(
      3,
    );
    console.log(
      `[Medición] ID: ${res.locals.solicitudId} | Método: ${req.method} | URL: ${req.originalUrl} | Estado: ${res.statusCode} | Duración: ${milisegundos}ms`,
    );
  });

  next();
}

module.exports = { crearIdentificarSolicitud, medirDuracion };
