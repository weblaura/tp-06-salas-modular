# Trabajo práctico 06

Reservas de salas de estudio, reorganizadas en módulos (arranque, configuración, aplicación, rutas, controladores, servicio y middleware).

## Proyecto de partida y cambios

Partida: `weblaura/tp-05-salas-middleware` 

Cambios:

- Se separó en módulos con una responsabilidad cada uno (ver mapa).
- El arreglo de reservas dejó de ser una variable global: vive dentro del servicio.
- `PORT` y `NODE_ENV` se leen del entorno; el formato de Morgan depende de `NODE_ENV`.
- Se agregó ESLint y Prettier.
- **Reparación previa a la refactorización (detectada leyendo el TP 05; confirmar ejecutándolo):**
  1. La validación aceptaba `personas` fraccionarias (por ejemplo `2.5`), porque solo comprobaba `isNaN`, `< 1` y `> 6`. Ahora exige entero (`Number.isInteger`), como pide el contrato.
  2. Si un campo llegaba repetido (`estudiante=a&estudiante=b`), `.trim()` se aplicaba a un arreglo y el servidor respondía 500. Ahora un valor que no es texto se trata como vacío y responde 400.

  Lo demás (mensajes, reglas, valores previos, vistas, CSS, semilla) se conserva igual.

## Instalación y ejecución

```bash
npm install
npm start            # sin .env: usa PORT=3000 y NODE_ENV=development
npm run start:local  # requiere un archivo .env local (Node >= 20.6)
```

`package-lock.json` se genera con `npm install` 

## Configuración del entorno

| Variable | Predeterminado | Efecto |
| --- | --- | --- |
| `PORT` | `3000` | Puerto de escucha. Debe ser entero entre 1 y 65535. |
| `NODE_ENV` | `development` | `production` usa el formato `combined` de Morgan; cualquier otro valor usa `dev`. |

`NODE_ENV` **solo** cambia el formato del registro de Morgan; no activa ningún otro comportamiento.

Si `PORT` no es un entero o está fuera de rango, `configuracion.js` lanza un error y `index.js` imprime `Error de configuración: PORT inválido: "abc". Debe ser un número entero entre 1 y 65535.` y termina con código de salida 1 sin escuchar.

`.env.example` está versionado con valores no secretos. `.env` y `node_modules/` están en `.gitignore`. Para usar `start:local`: `cp .env.example .env`.

## Mapa de módulos y dependencias

```
src/
|-- index.js                    semilla, configuración, servicio, app, listen
|-- configuracion.js            process.env -> { puerto, entorno, formatoRegistro }
|-- app.js                      vistas, pipeline, rutas globales, router, 404
|-- rutas/reservas.js           método/camino -> middleware + controlador
|-- controladores/reservas.js   req/res -> servicio -> vista, JSON, 404, redirección
|-- servicios/reservas.js       arreglo en memoria: listar, buscar, contar, crear
`-- middleware/
    |-- solicitudes.js          identificarSolicitud (BIB-xxxx), medirDuracion
    `-- reservas.js             sección "Reservas de salas" y validarReserva
```

Dependencias (quién requiere a quién):

```
index.js -> configuracion.js, servicios/reservas.js, app.js
app.js   -> middleware/solicitudes.js, controladores/reservas.js, rutas/reservas.js
rutas/reservas.js -> middleware/reservas.js
```

`servicios/reservas.js` y `configuracion.js` no requieren Express. `inicio` y `estado` están en el controlador de reservas por simplicidad, y `app.js` los monta en `/` y `/estado`.

Por qué el servicio no usa `res`: el servicio solo sabe de reservas (listar, buscar, contar, crear). Decidir una vista, un JSON, un 404 o una redirección es trabajo del controlador. Así el servicio no depende de HTTP y se puede probar con un arreglo y funciones comunes.

Qué hace el controlador: lee `req.params` y `req.reservaValidada`, le pide datos al servicio y responde con `res.render`, `res.json`, `res.status(404)` o `res.redirect`. No guarda el arreglo ni llama a `listen`.

Por qué el router declara caminos relativos: `rutas/reservas.js` declara `/`, `/nueva` y `/:id`, no `/reservas/...`. El prefijo se define una sola vez, en `app.use('/reservas', ...)` de `app.js`. Si mañana el prefijo cambia, se toca un solo lugar y no se duplica `/reservas` en las rutas internas.

Dónde vive el único arreglo: dentro del cierre de `crearServicioReservas(datosIniciales)`, en `servicios/reservas.js`. `index.js` crea **una sola instancia** y la pasa a `crearApp`, que se la da al controlador; listado, detalle, `/estado` y alta usan la misma. El servicio copia la semilla, por lo que crear reservas no modifica `RESERVAS_INICIALES`.

## Pipeline y contrato de rutas

```
Morgan -> identificarSolicitud -> medirDuracion -> layouts -> static
       -> urlencoded -> json -> rutas de aplicación (/, /estado)
       -> router /reservas -> 404
```

Dentro del router `/reservas`: `prepararSeccionReservas` -> ruta (`/`, `/nueva`, `/:id`, o `POST /` con `validarReserva` -> `crear`).

Qué solicitudes quedan registradas: Morgan está primero, así que registra **todas**, incluidas las de recursos estáticos (`/css/estilos.css`) y las que terminan en 404. `identificarSolicitud` y `medirDuracion` también corren antes de `static`, por lo que la línea `[Medición]` aparece para todas, con el estado final (200, 302, 400 o 404) tomado en el evento `finish`. Se mantiene el orden del TP 05.

| Método y ruta | Respuesta |
| --- | --- |
| `GET /` | 200, inicio |
| `GET /estado` | 200, JSON `{ servicio, cantidadReservas, solicitudId: "BIB-xxxx" }` |
| `GET /reservas` | 200, listado |
| `GET /reservas/nueva` | 200, formulario (registrada antes de `/:id`) |
| `GET /reservas/:id` | 200, o 404 HTML si no existe |
| `POST /reservas` | 302 a `/reservas` si es válido; 400 con el formulario, errores y valores previos si no |
| `GET /css/estilos.css` | 200 |
| otra URL | 404 HTML (`no-encontrado`) |

Validación: estudiante obligatorio, email con `@`, sala y turno de la lista permitida, fecha obligatoria, personas entero entre 1 y 6. `express.urlencoded` corre antes del validador. El camino inválido responde 400 y **no** llama a `next()`; el válido guarda `req.reservaValidada` y continúa al controlador.

## Matriz antes/después

Reproducir (con el servidor corriendo; cambiar el puerto si hace falta). Para "antes", levantar el TP 05 con `npm start` en su carpeta.


### Línea de base (TP 05, antes de mover código)

| Solicitud | Esperado | Observado (estado / vista / reservas / evidencia) |
| --- | --- | --- |
| `GET /` | 200, inicio | pendiente |
| `GET /estado` | 200, JSON, 4 reservas, `BIB-` | pendiente |
| `GET /reservas` | 200, listado de 4 | pendiente |
| `GET /reservas/nueva` | 200, formulario | pendiente |
| `GET /reservas/1` / `/reservas/999` | 200 / 404 `no-encontrado` | pendiente |
| `POST` inválido | 400, sin alta | pendiente (ver reparación: `personas=2.5` se esperaba aceptado) |
| `POST` válido | 302, luego `GET /reservas` 200, 5 reservas | pendiente |
| `GET /css/estilos.css` | 200 | pendiente |
| `GET /url-inexistente` | 404 `no-encontrado` | pendiente |

### Después (TP 06) y casos adicionales

| Caso | Esperado | Observado antes | Observado después |
| --- | --- | --- | --- |
| Inicio y CSS | 200; ID `BIB-` visible en el pie | pendiente | pendiente |
| Estado inicial | 200, `cantidadReservas: 4`, ID | pendiente | pendiente |
| Listado y detalle existente | 200, mismos datos | pendiente | pendiente |
| Detalle inexistente | 404 HTML, el servidor sigue vivo | pendiente | pendiente |
| Formulario | 200, campos y selects | pendiente | pendiente |
| POST vacío | 400, sin alta | pendiente | pendiente |
| Sala no permitida | 400, sin alta | pendiente | pendiente |
| Email sin `@` | 400, sin alta | pendiente | pendiente |
| Personas 0, 7 o 2.5 | 400, sin alta | pendiente | pendiente |
| POST válido | 302 y luego 200; nueva reserva en listado y `/estado` | pendiente | pendiente |
| URL inexistente | 404 HTML | pendiente | pendiente |
| Reinicio | 200, vuelve a 4 reservas | pendiente | pendiente |
| Puerto alternativo (`PORT=4000 npm start`) | 200 en `localhost:4000` | n/a | pendiente |
| Puerto inválido (`PORT=abc npm start`, `PORT=70000 npm start`) | no inicia, mensaje explícito, código de salida 1 | n/a | pendiente |

Morgan y la medición propia deben mostrar 200, 302, 400 y 404 en consola, igual que antes, al menos para inicio, listado, formulario, POST inválido, POST válido y 404.

Comprobado hasta ahora sin dependencias (Node 22): `node --check` de los 8 módulos; configuración (`PORT` ausente, `4000`, `abc`, `3000.5`, `0`, `65536`, `-1`, vacío, `NODE_ENV=production`); servicio (ids, conteo, semilla intacta); validador (11 casos inválidos responden 400, no llaman a `next()` y no crean `reservaValidada`; el válido normaliza y continúa); `/estado` refleja un alta hecha por el controlador sobre la misma instancia del servicio. Esto **no** sustituye la matriz HTTP.

## Formato y análisis estático

```bash
npm install                                   # genera package-lock.json y node_modules
npm install --save-dev prettier eslint @eslint/js   # equivalente; ya figuran en package.json
npm run format
npm run check
```

