const PUERTO_PREDETERMINADO = 3000;
const PUERTO_MINIMO = 1;
const PUERTO_MAXIMO = 65535;
const ENTORNO_PREDETERMINADO = 'development';

function convertirPuerto(valor) {
  if (valor === undefined) {
    return PUERTO_PREDETERMINADO;
  }

  const texto = String(valor).trim();

  if (!/^\d+$/.test(texto)) {
    throw new Error(
      `PORT inválido: "${valor}". Debe ser un número entero entre ${PUERTO_MINIMO} y ${PUERTO_MAXIMO}.`,
    );
  }

  const puerto = Number(texto);

  if (puerto < PUERTO_MINIMO || puerto > PUERTO_MAXIMO) {
    throw new Error(
      `PORT fuera de rango: ${puerto}. Debe estar entre ${PUERTO_MINIMO} y ${PUERTO_MAXIMO}.`,
    );
  }

  return puerto;
}

function leerConfiguracion(env = process.env) {
  const entorno = (env.NODE_ENV || '').trim() || ENTORNO_PREDETERMINADO;

  return {
    puerto: convertirPuerto(env.PORT),
    entorno,
    // Solo diferencia el formato del registro de Morgan.
    formatoRegistro: entorno === 'production' ? 'combined' : 'dev',
  };
}

module.exports = { leerConfiguracion };
