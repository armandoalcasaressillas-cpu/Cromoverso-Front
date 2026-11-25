# Home de Cromoverso

Proyecto React y Vite independiente. Incluye código ejecutable del home, componentes funcionales, estilos por componente y tokens. No depende de las otras carpetas del material.

## Ejecutar

Requiere Node.js 20.19 o posterior en la rama 20, o Node.js 22.12 o posterior.

```sh
npm ci
npm run dev
```

Abre la dirección que muestre Vite. Cada proyecto sirve su home en `/`.

```sh
npm run build
npm run preview
```

## Organización

- `src/pages/Home.jsx`: composición del home y acciones de demostración.
- `src/components/`: cada carpeta incluye el componente `.jsx` y su `.css`.
- `src/styles/tokens.css`: colores de marca, fuentes, espaciado y radio.
- `src/styles/base.css`: reset, contenedores y elementos comunes.
- `src/data/catalogo.js`: catálogo local de ejemplo.
- `src/data/interfaz.js`: traducciones ES/EN de navegación y preferencias.
- `src/context/PreferenciasContext.jsx`: estado compartido de idioma y consentimiento.
- `src/services/cookies.js`: lectura, guardado y eliminación de cookies.
- `src/services/api.js`: cliente GET para la API real del proyecto.
- `src/hooks/useRecurso.js`: consulta cancelable, carga, error y reintento.
- `src/hooks/useDetalle.js`: diálogo informativo y acceso a «Ingresar».
- `src/pages/Ingresar.jsx`: vista 4, inicio de sesión con todos sus estados (Sprint 2).
- `src/pages/ResolverCromo.jsx`: entrada directa a `/cromos/:id` y página de cromo no encontrado (Sprint 2).
- `src/components/DetalleCromo/`: vista 3, detalle de un cromo con `GET /cromos/:id` (Sprint 2).
- `src/context/SesionContext.jsx`: sesión con `GET/POST/DELETE /sesion` y sesión vencida (Sprint 2).
- `src/utils/navegacion.js`: navegación con `pushState` sin librerías de routing.

## Variables de entorno

Copia `.env.example` a `.env`. Define `VITE_API_URL=https://yanethm-cromoverso-api.fly.dev/api/v1`. En Vercel se configura en Settings → Environment Variables.

## Componentes incluidos

- `AbanicoCromos/AbanicoCromos.jsx` y `AbanicoCromos/AbanicoCromos.css`.
- `BannerCookies/BannerCookies.jsx` y `BannerCookies/BannerCookies.css`.
- `DialogoDetalle/DialogoDetalle.jsx` y `DialogoDetalle/DialogoDetalle.css`.
- `Flecha/Flecha.jsx` y `Flecha/Flecha.css`.
- `Footer/Footer.jsx` y `Footer/Footer.css`.
- `GestorCookies/GestorCookies.jsx` y `GestorCookies/GestorCookies.css`.
- `HeroCromoverso/HeroCromoverso.jsx` y `HeroCromoverso/HeroCromoverso.css`.
- `IconoMundo/IconoMundo.jsx` y `IconoMundo/IconoMundo.css`.
- `IlustracionCromo/IlustracionCromo.jsx` y `IlustracionCromo/IlustracionCromo.css`.
- `LayoutPublico/LayoutPublico.jsx` y `LayoutPublico/LayoutPublico.css`.
- `Marca/Marca.jsx` y `Marca/Marca.css`.
- `MenuMovil/MenuMovil.jsx` y `MenuMovil/MenuMovil.css`.
- `Navbar/Navbar.jsx` y `Navbar/Navbar.css`.
- `PreferenciasCookies/PreferenciasCookies.jsx` y `PreferenciasCookies/PreferenciasCookies.css`.
- `SaltarContenido/SaltarContenido.jsx` y `SaltarContenido/SaltarContenido.css`.
- `SeccionMundos/SeccionMundos.jsx` y `SeccionMundos/SeccionMundos.css`.
- `SelectorIdioma/SelectorIdioma.jsx` y `SelectorIdioma/SelectorIdioma.css`.
- `TarjetaCromo/TarjetaCromo.jsx` y `TarjetaCromo/TarjetaCromo.css`.
- `TarjetaMundo/TarjetaMundo.jsx` y `TarjetaMundo/TarjetaMundo.css`.

## Reutilizar

Importa el componente desde su carpeta y entrega sus datos por props. El componente importa su CSS. El archivo `main.jsx` carga tokens y estilos base una vez; otra página que use estos componentes debe mantener esas dos importaciones.

`LayoutPublico` compone Navbar, Footer, enlace de salto, contenido y gestor de cookies. Requiere `PreferenciasProvider`, ya montado en `main.jsx`. Las tarjetas reciben datos y callbacks; no hacen solicitudes HTTP por instancia.

Los estilos están separados por responsabilidad, pero usan las clases y los tokens del proyecto. Para copiar una tarjeta a otra aplicación, incluye sus componentes hijos, su CSS y los tokens que utiliza.

## Datos y API

**El home usa datos locales y funciona sin backend.** El cliente HTTP y el hook están incluidos para la práctica de integración, pero no sustituyen automáticamente el catálogo ni los textos locales. No se anuncia una integración remota que todavía no está conectada.

API configurada: `https://yanethm-cromoverso-api.fly.dev/api/v1`.

Endpoints del home: `GET /mundos`, `GET /rarezas`, `GET /cromos`, `GET /idiomas` y `GET /textos?idioma=es`.

Las listas llegan en `datos`, las listas paginadas incluyen `paginacion` y los textos llegan en `textos`. Consulta el [contrato](https://yanethm-cromoverso-api.fly.dev/docs/contrato) antes de adaptar campos. El formulario de fecha de Taquilla es una demostración local: el contrato no documenta filtro remoto por fecha.

Para integrar, usa `useRecurso` en el contenedor, adapta la respuesta al objeto que esperan las tarjetas y pasa ese resultado por props. Maneja carga y error antes de renderizar. Los componentes de presentación no necesitan conocer la URL de la API.

## Cookies e idioma

El banner permite aceptar, rechazar o configurar. El footer vuelve a abrir el diálogo. Solo se persiste el idioma si se aceptan preferencias; al rechazarlas se elimina la cookie de idioma.

Se usan nombres `cromoverso_consentimiento` y `cromoverso_idioma`, con `Path=/`, para aislar estas demostraciones incluso cuando se ejecutan bajo el mismo host con diferentes puertos. Esta es una decisión del material distribuible; los contratos describen los nombres generales `consentimiento` e `idioma`.

No se instalan servicios de analítica ni publicidad y no se crea una sesión de usuario. La decisión se guarda por seis meses. Si el navegador bloquea el almacenamiento se muestra un error.

## Accesibilidad

Enlace de salto al contenido, menú con `aria-expanded`, Escape y retorno de foco, selector de idioma con `aria-pressed`, formularios etiquetados, estados anunciados, diálogos nativos y CSS para movimiento reducido. Comprueba teclado y zoom al modificar los componentes.

## Alcance

Solo el home. Los botones de cuenta abren un aviso; las tarjetas abren detalles locales de demostración. No hay registro, reproducción, compra ni vistas adicionales. Las fuentes de Google Fonts requieren conexión; el CSS incluye fuentes de respaldo.
