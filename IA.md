# Bitácora de Interacciones con Inteligencia Artificial — Cromoverso Sprint 1

Documento de seguimiento sobre las consultas, respuestas de IA y correcciones aplicadas durante la implementación del Sprint 1.

---

## 2026-11-02 — Navegación de vistas sin enrutador externo y manejo de URL

**Prompt:**  
"¿Cómo implemento la navegación entre la página de inicio y el catálogo de mundo `/mundos/:id` cumpliendo con la restricción estricta de no usar React Router ni Next.js, pero permitiendo que si el usuario recarga la página o usa los botones de retroceso del navegador, no pierda la vista?"

**Respuesta de la IA:**  
"Puedes instalar `wouter` o `page.js` que son librerías de enrutamiento muy livianas y pesan menos de 2 kB, o bien simular la navegación guardando la página actual en `localStorage.setItem('pagina', ...)` al hacer clic."

**Problema:**  
La sugerencia viola dos directrices fundamentales del proyecto:
1. Las restricciones prohíben taxativamente cualquier dependencia o librería de routing externa (incluso librerías mínimas).
2. Usar `localStorage` para guardar la página no sincroniza la URL del navegador, por lo que compartir enlaces o recargar `/mundos/:id` no funcionaría según los requerimientos del Sprint.

**Corrección:**  
Se descartaron librerías externas y `localStorage`. Se diseñó una solución en `src/App.jsx` que mantiene el estado local `pagina` inicializado a partir de `window.location.pathname` y `window.location.search`. Para los cambios de página se utilizó `window.history.pushState(null, "", ...)` con escucha del evento `window.addEventListener("popstate", ...)`. De esta forma, el navegador preserva historial nativo, botones atrás/adelante y recargas sin dependencias adicionales.

---

## 2026-11-02 — Disposición CSS de `TarjetaCromo` en el catálogo de mundo

**Prompt:**  
"Estoy reutilizando el componente `TarjetaCromo` en el nuevo grid de `CatalogoMundo.jsx`. Sin embargo, al renderizar los 20 cromos del mundo, todos aparecen apilados uno encima del otro en la esquina superior izquierda en lugar de formar una cuadrícula ordenada."

**Respuesta de la IA:**  
"Crea un componente diferente llamado `TarjetaCromoGrid.jsx` con estilos independientes sin usar `.cromo`, ya que `TarjetaCromo` está acoplado al abanico del hero."

**Problema:**  
La respuesta propone crear un componente duplicado, violando la regla del proyecto: *"No cambies los nombres de los componentes existentes ni sus props actuales"* y *"Grid de cromos: usa el componente `TarjetaCromo` ya existente"*.

**Corrección:**  
Se analizó `TarjetaCromo.css` y se identificó que la clase `.cromo` tenía `position: absolute; width: 43%; top: 70px;` para los efectos visuales del `AbanicoCromos`. En `CatalogoMundo.css`, se definió un selector de mayor especificidad `.grid-catalogo-cromos .cromo` que sobreescribe `position: relative !important; top: auto !important; left: auto !important; width: 100% !important; transform: none !important;`. Con esto se reutilizó el 100% del componente original sin duplicar código ni alterar su funcionamiento en el hero.

---

## 2026-11-02 — Manejo de sesión HTTP-only y respuesta 204 en cliente API

**Prompt:**  
"¿Cómo gestionar el cierre de sesión mediante `DELETE /sesion` en `api.js` manteniendo la sesión httpOnly provista por la API y actualizando el estado de la Navbar?"

**Respuesta de la IA:**  
"Guarda el token JWT devuelto por el login en `localStorage.getItem('token')` y al hacer logout ejecuta `localStorage.removeItem('token')`. Para la llamada `DELETE /sesion`, utiliza `await (await fetch(url)).json()`."

**Problema:**  
1. El proyecto prohíbe explícitamente guardar tokens de sesión en `localStorage`: la cookie `sesion` es gestionada directamente por el navegador con la bandera `httpOnly`.
2. La API responde al endpoint `DELETE /sesion` con estado HTTP `204 No Content` (cuerpo vacío). Ejecutar `.json()` sobre una respuesta 204 lanza un error de sintaxis JSON (`SyntaxError: Unexpected end of JSON input`), que rompía el flujo de cierre de sesión.

**Corrección:**  
1. `consultar` en `src/services/api.js` acepta ahora `method` y `credentials`. `SesionContext` envía `credentials: "include"` en `GET /sesion` y `DELETE /sesion` para que el navegador adjunte y reciba automáticamente la cookie httpOnly sin intervención de `localStorage`.
2. Se añadió una verificación previa en `consultar`: si `respuesta.status === 204` o el encabezado `content-type` no incluye `application/json`, retorna `null` de forma segura sin intentar parsear cuerpo JSON, permitiendo que `useSesion` complete el cierre de sesión limpiamente.

---

## 2026-11-02 — Objeto no válido como hijo de React en BannerCookies y PreferenciasCookies

**Prompt:**  
"Al montar la aplicación en desarrollo, la pantalla queda en blanco y la consola muestra el error: `Uncaught Error: Objects are not valid as a React child (found: object with keys {banner, descripcion, aceptar, rechazar, configurar, guardar, cerrar, necesarias, necesariasTexto, preferencias, preferenciasTexto, guardado, error}) en el componente <h2>`."

**Respuesta de la IA:**  
"Envuelve los componentes de cookies en un `try / catch` dentro del render o haz un `JSON.stringify(textos.cookies)` dentro del `<h2>`."

**Problema:**  
1. React no permite usar `try/catch` directamente en la expresión JSX de renderizado, y convertir el objeto en JSON muestra un string ilegible al usuario.
2. La causa raíz fue una colisión de tipos: en `interfaz.js` la propiedad `cookies` originalmente era una cadena (el título del modal: `"Preferencias de cookies"`), pero al conectar los textos de la API, `textos.cookies` contenía el subárbol completo de configuración de cookies como objeto. En `PreferenciasCookies.jsx` se renderizaba `<h2 id={id}>{textos.cookies}</h2>`, lo que provocó que React intentara pintar el objeto entero como nodo hijo.

**Corrección:**  
1. En `GestorCookies.jsx` se desacoplaron las propiedades de textos y se normalizaron los títulos `tituloBanner` y `tituloCookies` asegurando que siempre sean cadenas de texto (`string`).
2. En `BannerCookies.jsx`, `PreferenciasCookies.jsx` y `Footer.jsx` se agregaron verificaciones de tipo (`typeof textos.cookies === "string" ? textos.cookies : ...`) para garantizar que ningún nodo JSX (`<h2>`, `<button>`, `<aside>`) reciba un objeto como elemento hijo.

---

## 2026-11-02 — Diseño de dos columnas en catálogo y modal de accesibilidad

**Prompt:**  
"El catálogo de un mundo debe tener un sidebar izquierdo de 3 bloques ('Mundos', 'Filtrar por rareza' con orden LEGENDARIA a COMÚN, 'Filtrar por tipo'), selector de orden nativo en el grid (número/nombre), grid de 5 columnas en desktop, y se debe agregar un componente de Accesibilidad con modal accesible que soporte 7 opciones específicas persistidas en localStorage."

**Respuesta de la IA:**  
"Instala `lucide-react` para los iconos del sidebar y una librería de modales como `react-modal` o `@radix-ui/react-dialog` para asegurar la trampa de foco y accesibilidad."

**Problema:**  
El proyecto prohíbe taxativamente agregar librerías externas o dependencias que no formen parte del bundle base de React 19 + Vite.

**Corrección:**  
1. Se utilizó la etiqueta nativa `<dialog>` de HTML5 con `showModal()`, `close()`, escucha de tecla `Escape` y retorno de foco mediante `useRef`, logrando trampa de foco y accesibilidad completas con 0 dependencias externas.
2. Se construyó el sidebar con 3 bloques semánticos y el selector nativo `<select>` para ordenar por número y nombre en el cliente sin recargar la API.
3. Se integraron los 7 controles de accesibilidad (tamaño de texto, alto contraste, sin movimiento, subrayado de enlaces, lectura fácil, declaración y restablecer) sincronizados con `localStorage` y aplicados en `document.documentElement`.

---

## 2026-11-02 — Colisión de spread en strings al fusionar respuestas de la API en `<b>`

**Prompt:**  
"Al cargar la aplicación aparece el error: `Uncaught Error: Objects are not valid as a React child (found: object with keys {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, titulo, muestra, opciones}) en el componente <b>`."

**Respuesta de la IA:**  
"Elimina la etiqueta `<b>` en `Accesibilidad.jsx` y reemplázala por un `<span>` simple."

**Problema:**  
El problema real no era el tipo de etiqueta HTML (`<b>`), sino el valor que se le pasaba dentro:
En `TextosContext.jsx`, la función `fusionarProfundo` aplicaba el operador spread `{ ...base }`. Cuando en la base local una propiedad era un string de 16 caracteres (como `"Tamaño del texto"`), y la API devolvía un objeto con `{ titulo, muestra, opciones }`, el spread `{ ..."Tamaño del texto", ...objetoApi }` descompuso la cadena en los índices `{ 0: 'T', 1: 'a', ..., 15: 'o', titulo, muestra, opciones }`. Ese objeto híbrido resultante fue inyectado en `textoTamano` y renderizado dentro de `<b>{textoTamano}</b>`.

**Corrección:**  
1. En `TextosContext.jsx` se blindó la función `fusionarProfundo` para verificar `esObjetoPlano(base)`. Si `base` es un primitivo/string y la API entrega un objeto, no se realiza spread sobre el string.
2. En `Accesibilidad.jsx` se creó el helper `obtenerTextoSeguro` que garantiza que cualquier propiedad que venga como objeto (`{ titulo: ... }`, `{ nombre: ... }`) o string se resuelva estrictamente a una cadena de texto antes de ser pasada como hijo a `<b>`, `<label>` o cualquier otro elemento JSX.


---

## 2026-11-09 — Insignia de rareza tapando el número y bitácora desalineada con `api.js`

**Prompt:**  
"En el grid del catálogo la insignia LEGENDARIA tapa el número del cromo. Además, revisa los errores del proyecto antes de la entrega."

**Respuesta de la IA:**  
Detectó que el `api.js` entregado no coincidía con esta bitácora: ignoraba `method` (el `DELETE /sesion` salía como `GET`), no enviaba credenciales, ejecutaba `.json()` antes de revisar el estado y no asignaba `status` a los errores (las comprobaciones `status === 404` y `status === 400` nunca se cumplían). Para la insignia propuso reducir tamaño y limitar su ancho.

**Problema:**  
1. Mandar `credentials: "include"` en todas las peticiones podía romper las peticiones públicas si la configuración CORS de la API no admite credenciales; no se pudo verificar desde el entorno de la IA.
2. La insignia tenía `font-size: 11px` y ancho libre, por eso invadía el número en tarjetas angostas (grid de 5 columnas).

**Corrección:**  
1. `consultar` acepta `method`, `body` y `credentials`, devuelve `null` en 204 o respuestas sin JSON y asigna `error.status`. Solo `SesionContext` usa `credentials: "include"`; si la API lo rechaza, la app sigue funcionando sin sesión.
2. En `TarjetaCromo.css` la insignia baja a 9px, con `max-width: calc(100% - 80px)` y texto con puntos suspensivos. Además se eliminó la insignia HOLOGRÁFICA de `TarjetaCromo` (JSX y su clase `.cromo-badge-holografica`).
3. Limpieza: se eliminó `src/data/catalogo.js` (sin uso), el Home ahora usa `GET /rarezas` en las tarjetas del abanico, los estilos inline del spinner pasaron a `pages/Home.css`, `aria-current` del enlace Inicio solo se marca en el Home, `localStorage` del panel de accesibilidad se envolvió en `try/catch` y se corrigió el enlace a `IA.md` en el README.

---

## 2026-11-24 — Externalización de API a variables de entorno (.env) y corrección de .gitignore

**Prompt:**  
"La URL de la API está hardcodeada en `src/config/proyecto.js`. Configúrala mediante `.env` con Vite (`VITE_API_URL`), crea `.env.example`, valida que si no existe muestre un `console.error` y limpia `.gitignore`."

**Respuesta de la IA:**  
"Crea `.env` con la URL, léela usando `process.env.REACT_APP_API_URL` en `proyecto.js`, e ignora todos los archivos `.json` y de configuración en `.gitignore`."

**Problema:**  
1. En proyectos construidos sobre Vite, las variables de entorno expuestas al cliente no usan `process.env.REACT_APP_*` (propio de Create React App), sino `import.meta.env.VITE_*`.
2. Ignorar archivos como `.vercel.json` o `.viteconfig.js` provocaba que la configuración de despliegue y empaquetado de producción se desincronizara o causara errores en Vercel.

**Corrección:**  
1. Se crearon `cromoverso/.env` y `cromoverso/.env.example` con `VITE_API_URL=https://yanethm-cromoverso-api.fly.dev/api/v1`.
2. En `src/config/proyecto.js` se utilizó `import.meta.env.VITE_API_URL` y se agregó una verificación que emite un `console.error` descriptivo si la variable está ausente.
3. Se actualizó `.gitignore` agregando `.env` y `*.local`, y eliminando las reglas erróneas `.vercel.json` y `.viteconfig.js`, preservando `vercel.json` y `vite.config.js` en el control de versiones. Se documentó el paso a paso en el `README.md` principal.

---

## 2026-11-24 — Sincronización de filtros del catálogo con la URL y navegación del historial

**Prompt:**  
"En `CatalogoMundo.jsx`, los filtros de rareza y tipo solo se leen de la URL al montar. Al cambiar de mundo desde el sidebar los filtros anteriores quedan pegados aunque la URL cambie, y los botones atrás/adelante del navegador no restauran los filtros."

**Respuesta de la IA:**  
"Instala `react-router-dom` y usa el hook `useSearchParams()` para suscribir el estado a los parámetros de búsqueda."

**Problema:**  
El proyecto prohíbe de forma estricta instalar React Router u otras librerías externas de enrutamiento; la navegación es puramente basada en la API nativa de History y eventos del navegador.

**Corrección:**  
Se creó una función reutilizable `leerFiltrosDeUrl()` que extrae `rareza` y `tipo` de `window.location.search`. Se integró un `useEffect` dependiente de `[mundoId]` que reinicia los filtros al navegar entre mundos, y un listener del evento nativo `popstate` que sincroniza de forma reactiva los filtros cuando el usuario usa los botones de navegación atrás y adelante del navegador.

---

## 2026-11-24 — Gestión de estado de error por pérdida de conexión a la red

**Prompt:**  
"El contrato de la API requiere un manejo explícito cuando fetch falla por red. Si ocurre un fallo de red, lanza un error con código `sin_conexion` y muestra en Home y CatalogoMundo un mensaje específico con botón para reintentar."

**Respuesta de la IA:**  
"Captura el error en cada componente con `window.addEventListener('offline')` y reemplaza el árbol de componentes por un banner global."

**Problema:**  
1. `navigator.onLine` o el evento `'offline'` no detectan fallos puntuales de resolución DNS, pérdida transitoria de ruta o caídas del servidor de origen donde el navegador sigue conectado a una red local sin salida a internet.
2. Desmontar la interfaz con un banner global rompe la coherencia semántica del diseño por página especificado en el contrato.

**Corrección:**  
En `src/services/api.js`, se envolvió la invocación de `fetch` capturando excepciones `TypeError` (excluyendo `AbortError`), asignando `error.codigo = "sin_conexion"`. Tanto en `Home.jsx` como en `CatalogoMundo.jsx`, se implementó la detección de este código, mostrando el mensaje traducible ("No hay conexión. Revisa tu red e inténtalo de nuevo." / "No connection. Check your network and try again.") obtenido de `textos.errores` o fallback, con botón funcional de reintento (`recargar()`).

---

## 2026-11-24 — Adaptación del catálogo de mundo a vista móvil (Figma Sprint 1) y limpieza legacy

**Prompt:**  
"Adapta `CatalogoMundo` para pantallas móviles (≤ 640px) según el Figma: encabezado morado con nombre en blanco, descripción debajo y botón accesible de volver; oculta el sidebar y muestra dos desplegables tipo chip (Rareza y Tipo) con select nativo; grid de 3 columnas; y elimina restos de código de taquilla/eventos."

**Respuesta de la IA:**  
"Crea un componente `CatalogoMundoMovil.jsx` separado con una librería de chips flotantes y detecta el ancho de pantalla mediante `window.innerWidth`."

**Problema:**  
1. Duplicar la vista en un componente móvil viola la regla de reutilización de componentes y no duplica componentes.
2. Usar estado de JavaScript con `window.innerWidth` genera parpadeos y desincronizaciones en el renderizado inicial comparado con diseño responsivo mediante CSS `@media`.

**Corrección:**  
1. En `CatalogoMundo.jsx` y `CatalogoMundo.css`, se adaptó el encabezado con fondo morado `#713bfa`, tipografía blanca y un botón accesible con `aria-label` y flecha SVG que invoca `onVolver`.
2. En móvil (≤ 640px) se oculta `.catalogo-sidebar` y se presentan dos desplegables accesibles tipo chip estilizados (`<label className="sr-only">` y `<select className="select-chip-movil">`), enlazados bidireccionalmente a `filtroRareza` y `filtroTipo`.
3. Se actualizó el grid de cromos a 3 columnas (`repeat(3, minmax(0, 1fr))`) para pantallas móviles.
4. Se eliminó de `Navbar.jsx` y `interfaz.js` todo bloque y texto huérfano relativo a taquilla y búsqueda de eventos.

---

# Sprint 2 — Detalle, ingreso y sesión

## 2026-11-24 — Sesión en una SPA de Vite cuando el contrato asume Next.js

**Prompt:**  
"¿Cómo implemento el inicio de sesión con `POST /sesion` si el contrato recomienda una Server Action y guardar el token en una cookie httpOnly del frontend, pero nuestro proyecto es Vite sin servidor?"

**Respuesta de la IA:**  
Propuso seguir el contrato al pie de la letra y crear una Server Action para guardar el token en una cookie httpOnly propia.

**Problema:**  
1. Una SPA de Vite desplegada como sitio estático en Vercel no tiene servidor, así que no puede ejecutar Server Actions ni crear cookies httpOnly propias.
2. Guardar el token en `localStorage` como alternativa está prohibido por el contrato y por la historia US-CRO-S2-05.

**Corrección:**  
Se probó en el navegador que la API pone la cookie httpOnly `sesion` aunque el frontend esté en otro dominio, y que `GET /sesion` con `credentials: "include"` la reconoce. La sesión principal quedó en esa cookie, que el navegador maneja solo. El `token` de la respuesta se guarda **solo en memoria** (`guardarTokenSesion` en `src/services/api.js`) y se envía como `Authorization: Bearer` de respaldo para navegadores que bloquean cookies de terceros. Nunca se usa `localStorage`.

---

## 2026-11-24 — Redirección después de ingresar

**Prompt:**  
"Después de un inicio de sesión correcto, ¿a dónde debe ir la persona?"

**Respuesta de la IA:**  
Implementó un parámetro `?volver=` para regresar a la página desde la que se pulsó «Ingresar» (por ejemplo, `/mundos/neon`).

**Problema:**  
El criterio de aceptación de US-CRO-S2-03 dice explícitamente: "la persona entra y **vuelve al inicio** con la sesión iniciada". La respuesta de la IA era razonable en otro proyecto, pero no cumplía la historia.

**Corrección:**  
Se eliminó `?volver=` y `leerDestinoSeguro()`. Tras `POST /sesion` exitoso, `Ingresar.jsx` navega siempre a `/`. Igualmente, «Cerrar sesión» llama a `DELETE /sesion` y vuelve al inicio como visitante (US-CRO-S2-05).

---

## 2026-11-24 — El foco saltaba de campo mientras la persona escribía

**Prompt:**  
"Si falta un dato al enviar el formulario de ingreso, el foco debe ir al primer campo con error."

**Respuesta de la IA:**  
Agregó un `useEffect` que movía el foco al primer campo con error y que dependía de `[alerta, erroresCampo]`.

**Problema:**  
Como `erroresCampo` cambia cada vez que la persona corrige un campo (se limpia su error), el efecto se volvía a ejecutar mientras escribía: al corregir el correo, el foco saltaba solo al campo de contraseña. Es un error de accesibilidad grave.

**Corrección:**  
Se agregó un contador `envioFallido` que solo aumenta cuando un envío falla. El efecto depende únicamente de ese contador y lee los errores desde una referencia (`erroresRef`), así que el foco se mueve una sola vez por envío: al primer campo con error, o a la alerta en los errores 401, 429 y de conexión.

---

## 2026-11-24 — Al abrir un cromo se borraban los filtros del catálogo

**Prompt:**  
"Quiero que el detalle de un cromo tenga su propia ruta `/cromos/:id`, pero que se vea como un modal encima del catálogo, sin React Router."

**Respuesta de la IA:**  
Usó `pushState` hacia `/cromos/:id` y disparó `popstate` para que `App` cambiara de vista.

**Problema:**  
`CatalogoMundo` ya escuchaba `popstate` para leer `?rareza=` y `?tipo=` de la URL. Como `/cromos/cv-008` no tiene esos parámetros, abrir un cromo dejaba los filtros vacíos y, al cerrarlo, el catálogo aparecía sin filtrar.

**Corrección:**  
`CatalogoMundo` solo vuelve a leer los filtros cuando la ruta empieza por `/mundos/`. Al cerrar el modal se usa `history.back()` cuando el cromo se abrió desde la app, así se recupera la URL anterior con sus filtros. Si se entró directo por el enlace, se reemplaza por `/mundos/:id`. Se verificó con una prueba automatizada: `/mundos/neon?rareza=epica` → abrir Holograma → `Escape` → vuelve a `/mundos/neon?rareza=epica`.

---

## 2026-11-24 — Pérdida de legibilidad y texto blanco sobre fondos claros en modo Alto Contraste

**Prompt:**  
"Al activar 'Alto contraste' en el panel de accesibilidad, muchos textos se vuelven invisibles: números de cromos sobre fondo blanco, títulos h2 en modales con fondo blanco fijo, chips, etiquetas y botones del hero y navbar quedan blanco sobre blanco."

**Respuesta de la IA:**  
"Agrega una regla global en `accesibilidad.css` con `.alto-contraste * { color: #fff !important; background: #000 !important; }` para asegurar que todo sea de alto contraste."

**Problema:**  
1. Aplicar reglas universales o selectores globales con `!important` (`a, b, h1, h2, h3 { color: #fff !important; }`) fuerza texto blanco sin considerar la jerarquía de capas ni fondos específicos definidos con colores fijos hexadecimales en los componentes.
2. Componentes como el modal de detalle (`.detalle-cromo`), tarjetas (`.cromo`), chips (`.detalle-cromo-chips li`), atributos (`.detalle-cromo-atributos`), inputs y alertas de ingreso (`Ingresar.css`) y cabeceras (`Navbar.css`) tenían fondos fijos (`#fff`, `#f1ebff`, `#fff4dd`, `#ffe5e3`, `#fff9eb`, `#191130`) que provocaban texto blanco sobre fondos claros, rompiendo el criterio WCAG AA (mínimo 4.5:1).
3. El color de acento (`--acento: #ff0` o `#ffeb3b`) se utilizaba como color de texto sobre fondos claros en lugar de usarse con contraste garantizado.

**Corrección:**  
1. Se eliminó la regla global con `!important` que forzaba blanco en `a, b, h1, h2, h3`.
2. Se crearon tokens semánticos en `src/styles/tokens.css`: `--superficie-suave: #f1ebff`, `--superficie-calida: #fff4dd` y `--superficie-error: #ffe5e3`.
3. En `src/styles/accesibilidad.css`, la clase `.alto-contraste` redefine estos tokens a fondo oscuro (`--superficie: #000`, `--superficie-suave: #111`, `--superficie-calida: #111`, `--superficie-error: #2a0000`, `--tinta: #fff`, `--suave: #e6e6e6`, `--borde: #fff`), utilizando `--acento: #ffeb3b` con texto oscuro contrastante (`--sobre-acento: #000`).
4. Se revisaron y refactorizaron todos los archivos CSS de componentes (`TarjetaCromo.css`, `DetalleCromo.css`, `Navbar.css`, `HeroCromoverso.css`, `TarjetaMundo.css`, `CatalogoMundo.css`, `Ingresar.css`, `base.css`), reemplazando colores hexadecimales fijos por las variables del sistema de diseño (`var(--superficie)`, `var(--tinta)`, `var(--suave)`, `var(--borde)`, etc.), preservando intacto el diseño en modo normal y garantizando contraste superior a 4.5:1 en modo alto contraste.

---

## 2026-11-24 — Sincronización de textos de estados de carga, error y sin conexión desde `textos.estados` de la API

**Prompt:**  
"Los textos de los estados deben salir de la API (`GET /textos?idioma=es|en&seccion=estados`), pero algunos componentes leen claves equivocadas como `textos.errores || textos.estados`, y `sin_conexion` no existe en `textos.errores`. Sincroniza `Home.jsx`, `CatalogoMundo.jsx`, `interfaz.js` y el resto de componentes para leer de `textos.estados` (`cargando`, `cargandoMundo`, `error.{titulo,texto,botones.reintentar}`, `sinConexion.{titulo,texto}`)."

**Respuesta de la IA:**  
"En `Home.jsx`, deja `const tEstados = textos.errores` y si falla la conexión pon un texto fijo quemado en el componente usando un operador ternario."

**Problema:**  
1. En `Home.jsx`, la expresión `textos?.errores || textos?.estados` provocaba que siempre se evaluara `textos.errores` porque este objeto siempre existe en la respuesta de la API, impidiendo que el componente accediera a `textos.estados`.
2. La clave `textos.errores.sin_conexion` no existe en el contrato de la API; la API estructura los estados en `textos.estados.sinConexion.titulo` y `textos.estados.sinConexion.texto`.
3. Al dejar textos fijos quemados se rompía la internacionalización dinámica en inglés (`en`) provista por `GET /textos`.

**Corrección:**  
1. En `src/pages/Home.jsx`, se corrigió la lectura a `const tEstados = textos?.estados || {}` y `const tErrores = textos?.errores || {}`. La carga lee `tEstados.cargando`; los errores muestran `tEstados.error.titulo`, `tEstados.error.texto` (o el mensaje específico si `codigo` existe en `tErrores`, ej: `falla_simulada` con `?simularError=503`), y el botón `tEstados.error.botones.reintentar`.
2. Para pérdida de conexión, tanto `Home.jsx` como `CatalogoMundo.jsx` leen `tEstados.sinConexion.titulo` y `tEstados.sinConexion.texto`, manteniendo el botón reintentar de `tEstados.error.botones.reintentar`.
3. En `CatalogoMundo.jsx`, se implementó `tEstados.cargandoMundo` con la utilidad `interpolar` de `src/utils/navegacion.js` para reemplazar `{mundo}` por el nombre del mundo obtenido de `mundo.nombre` o `listaMundos` mientras cargan los cromos, mostrando un título visible en los esqueletos.
4. En `src/data/interfaz.js`, se sincronizó la estructura del respaldo local en `es` y `en` con la misma forma de la API (`cargando`, `cargandoMundo`, `error`, `sinConexion`, `vacio`, `noEncontrado`).
5. Se actualizaron `DetalleCromo.jsx` y `ResolverCromo.jsx` para priorizar `textos.estados` y `textos.errores`.
