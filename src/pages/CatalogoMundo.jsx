import { useState, useMemo, useEffect } from "react";
import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import TarjetaCromo from "../components/TarjetaCromo/TarjetaCromo.jsx";
import IconoMundo from "../components/IconoMundo/IconoMundo.jsx";
import IlustracionCromo from "../components/IlustracionCromo/IlustracionCromo.jsx";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import DetalleCromo from "../components/DetalleCromo/DetalleCromo.jsx";
import Flecha from "../components/Flecha/Flecha.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useTextos } from "../context/TextosContext.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { useDetalle } from "../hooks/useDetalle.js";
import { obtenerTextoSeguro } from "../utils/textos.js";
import { interpolar } from "../utils/navegacion.js";
import "./CatalogoMundo.css";

export default function CatalogoMundo({
  mundoId,
  onVolver,
  onNavegarMundo,
  cromoId = null,
  onAbrirCromo,
  onCambiarCromo,
  onCerrarCromo,
}) {
  const { idioma } = usePreferencias();
  const en = idioma === "en";
  const { textos } = useTextos();
  const { detalle, setDetalle, abrirCuenta } = useDetalle(idioma);

  // Lectura de filtros de la URL
  function leerFiltrosDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return {
      rareza: params.get("rareza") || "",
      tipo: params.get("tipo") || "",
    };
  }

  // Filtros sincronizados con la URL
  const [filtroRareza, setFiltroRareza] = useState(() => leerFiltrosDeUrl().rareza);
  const [filtroTipo, setFiltroTipo] = useState(() => leerFiltrosDeUrl().tipo);

  // Selector de orden: 'numero' o 'nombre'
  const [orden, setOrden] = useState("numero");

  // Re-sincronizar filtros al cambiar mundoId y limpiar filtros al cambiar de mundo
  useEffect(() => {
    if (!window.location.pathname.startsWith("/mundos/")) return;
    const filtrosActuales = leerFiltrosDeUrl();
    setFiltroRareza(filtrosActuales.rareza);
    setFiltroTipo(filtrosActuales.tipo);
  }, [mundoId]);

  // Sincronizar filtros con popstate (botones atrás y adelante del navegador)
  useEffect(() => {
    function alCambiarHistorial() {
      // Al abrir un cromo la URL pasa a /cromos/:id: los filtros se conservan
      if (!window.location.pathname.startsWith("/mundos/")) return;
      const filtrosUrl = leerFiltrosDeUrl();
      setFiltroRareza(filtrosUrl.rareza);
      setFiltroTipo(filtrosUrl.tipo);
    }
    window.addEventListener("popstate", alCambiarHistorial);
    return () => window.removeEventListener("popstate", alCambiarHistorial);
  }, []);

  // GET /mundos para la lista del sidebar
  const { datos: resMundos } = useRecurso("/mundos");
  const listaMundos = resMundos?.datos || [];

  // GET /rarezas para iconos y colores
  const { datos: resRarezas } = useRecurso("/rarezas");
  const rarezasApi = resRarezas?.datos || [];

  // GET /mundos/:id
  const {
    datos: mundo,
    error: errorMundo,
    cargando: cargandoMundo,
    recargar: recargarMundo,
  } = useRecurso(mundoId ? `/mundos/${mundoId}` : null);

  // Sincronizar filtros activos en la URL con replaceState
  function actualizarFiltros(nuevaRareza, nuevoTipo) {
    setFiltroRareza(nuevaRareza);
    setFiltroTipo(nuevoTipo);
    const params = new URLSearchParams();
    if (nuevaRareza) params.set("rareza", nuevaRareza);
    if (nuevoTipo) params.set("tipo", nuevoTipo);
    const qs = params.toString();
    const nuevaUrl = qs ? `/mundos/${mundoId}?${qs}` : `/mundos/${mundoId}`;
    window.history.replaceState(null, "", nuevaUrl);
  }

  function alternarRareza(idRareza) {
    const siguiente = filtroRareza === idRareza ? "" : idRareza;
    actualizarFiltros(siguiente, filtroTipo);
  }

  function alternarTipo(idTipo) {
    const siguiente = filtroTipo === idTipo ? "" : idTipo;
    actualizarFiltros(filtroRareza, siguiente);
  }

  function limpiarFiltros() {
    actualizarFiltros("", "");
  }

  // Petición con filtros cuando están activos
  const tieneFiltros = Boolean(filtroRareza || filtroTipo);
  const paramsQuery = new URLSearchParams();
  if (filtroRareza) paramsQuery.set("rareza", filtroRareza);
  if (filtroTipo) paramsQuery.set("tipo", filtroTipo);
  paramsQuery.set("pagina", "1");
  paramsQuery.set("porPagina", "20");

  const rutaCromosFiltro = tieneFiltros
    ? `/cromos?mundo=${mundoId}&${paramsQuery.toString()}`
    : null;

  const {
    datos: resCromosFiltrados,
    cargando: cargandoCromos,
    error: errorCromos,
    recargar: recargarCromos,
  } = useRecurso(rutaCromosFiltro);

  // Orden estricto de rarezas: LEGENDARIA, ÉPICA, RARA, COMÚN
  const rarezasOrdenadas = useMemo(() => {
    const ordenClaves = ["legendaria", "epica", "rara", "comun"];
    const base = [
      { id: "legendaria", nombre: en ? "LEGENDARY" : "LEGENDARIA", icono: "corona", color: "#f59e0b" },
      { id: "epica", nombre: en ? "EPIC" : "ÉPICA", icono: "estrella", color: "#8b5cf6" },
      { id: "rara", nombre: en ? "RARE" : "RARA", icono: "rombo", color: "#3b82f6" },
      { id: "comun", nombre: en ? "COMMON" : "COMÚN", icono: "circulo", color: "#64748b" },
    ];
    return base.map((item) => {
      const encontrada = rarezasApi.find((r) => r.id?.toLowerCase() === item.id);
      return {
        ...item,
        nombre: (en ? item.nombre : encontrada?.nombre?.toUpperCase() || item.nombre),
        color: encontrada?.color || item.color,
        icono: encontrada?.icono || item.icono,
      };
    });
  }, [rarezasApi, en]);

  // Conteos por tipo (Héroe / Aliado / Villano)
  const conteoTipos = useMemo(() => {
    const todosCromos = mundo?.cromos || [];
    return {
      heroe: todosCromos.filter((c) => c.tipo?.toLowerCase() === "heroe").length,
      aliado: todosCromos.filter((c) => c.tipo?.toLowerCase() === "aliado").length,
      villano: todosCromos.filter((c) => c.tipo?.toLowerCase() === "villano").length,
    };
  }, [mundo]);

  // Lista de cromos procesada y ordenada en el frontend
  const cromosAvanzados = useMemo(() => {
    const crudo = tieneFiltros
      ? resCromosFiltrados?.datos || []
      : mundo?.cromos || [];

    const clon = [...crudo];
    if (orden === "nombre") {
      clon.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    } else {
      clon.sort((a, b) => {
        const numA = parseInt(a.numero, 10) || 0;
        const numB = parseInt(b.numero, 10) || 0;
        return numA - numB;
      });
    }
    return clon;
  }, [tieneFiltros, resCromosFiltrados, mundo, orden]);

  function abrirDetalleCromo(cromo) {
    // Sprint 2: detalle real con GET /cromos/:id y URL propia (/cromos/:id)
    if (onAbrirCromo) {
      onAbrirCromo(cromo);
      return;
    }
    const mundoAdaptado = {
      nombre: mundo?.nombre || "",
      color: cromo.ilustracion?.colorBase || mundo?.color || "#7b48ff",
      icono:
        cromo.ilustracion?.figura ||
        mundo?.figura ||
        mundo?.icono ||
        "estrella",
    };

    setDetalle({
      titulo: cromo.nombre,
      descripcion: `${mundo?.nombre} · № ${cromo.numero} · ${
        cromo.tipo === "heroe"
          ? en ? "Hero" : "Héroe"
          : cromo.tipo === "aliado"
            ? en ? "Ally" : "Aliado"
            : en ? "Villain" : "Villano"
      }`,
      contenido: <IlustracionCromo mundo={mundoAdaptado} />,
      cerrar: en ? "Close" : "Cerrar",
    });
  }

  const tAlbum = textos?.paginas?.albumMundo || {};
  const tEstados = textos?.estados || {};

  const textoNoEncontrado = obtenerTextoSeguro(
    tEstados.noEncontrado,
    en ? "World not found" : "Mundo no encontrado",
  );
  const detalleNoEncontrado =
    (typeof tEstados.noEncontrado === "object" &&
      tEstados.noEncontrado?.texto) ||
    (en
      ? "The world you requested does not exist or has been removed."
      : "El mundo solicitado no existe o no está disponible.");
  const textoVolverInicio = obtenerTextoSeguro(
    tEstados.noEncontrado?.botones?.irAlInicio || tEstados.volverInicio,
    en ? "Back to home" : "Volver al inicio",
  );
  const esSinConexion =
    errorMundo?.codigo === "sin_conexion" ||
    (tieneFiltros && errorCromos?.codigo === "sin_conexion");

  const textoSinConexionTitulo = obtenerTextoSeguro(
    tEstados.sinConexion?.titulo,
    en ? "No connection" : "Sin conexión",
  );
  const textoSinConexionDetalle = obtenerTextoSeguro(
    tEstados.sinConexion?.texto,
    en
      ? "No connection. Check your network and try again."
      : "No hay conexión. Revisa tu red e inténtalo de nuevo.",
  );

  const nombreMundoParaCarga =
    mundo?.nombre || listaMundos.find((m) => m.id === mundoId)?.nombre || "";

  const textoCargando = nombreMundoParaCarga && tEstados.cargandoMundo
    ? interpolar(tEstados.cargandoMundo, { mundo: nombreMundoParaCarga })
    : obtenerTextoSeguro(
        tEstados.cargando,
        en ? "Loading…" : "Cargando…",
      );

  // US-CRO-S2-02: el mensaje del error sale de textos.errores[codigo]
  // (por ejemplo falla_simulada con X-Simular-Error: 503)
  const codigoError = errorMundo?.codigo || (tieneFiltros ? errorCromos?.codigo : null);
  const tituloError = esSinConexion
    ? textoSinConexionTitulo
    : obtenerTextoSeguro(
        tEstados.error?.titulo || tEstados.error,
        en ? "An error occurred." : "Ha ocurrido un error.",
      );
  const detalleError = esSinConexion
    ? textoSinConexionDetalle
    : (codigoError && typeof textos?.errores?.[codigoError] === "string" && textos.errores[codigoError]) ||
      (typeof tEstados.error === "object" && tEstados.error?.texto) ||
      tituloError;
  const textoReintentar = obtenerTextoSeguro(
    tEstados.error?.botones?.reintentar || tEstados.reintentar,
    en ? "Retry" : "Reintentar",
  );
  const textoVacio = obtenerTextoSeguro(
    tAlbum.vacio || tEstados.vacio?.titulo || tEstados.vacio,
    en ? "No cards match that filter" : "No hay cromos con ese filtro",
  );
  const textoLimpiarFiltros = obtenerTextoSeguro(
    tAlbum.vacio?.botones?.limpiar || tAlbum.limpiarFiltros,
    en ? "Clear filters" : "Limpiar filtros",
  );

  // Manejo de error 404 (mundo no encontrado)
  const es404 =
    errorMundo &&
    (errorMundo.codigo === "no_encontrado" || errorMundo.status === 404);

  if (es404) {
    return (
      <LayoutPublico
        destino="/#mundos"
        etiqueta={en ? "Worlds" : "Mundos"}
        descripcion={
          en
            ? "Collect original heroes from six worlds."
            : "Colecciona héroes originales de seis mundos."
        }
        onCuenta={abrirCuenta}
      >
        <div className="ancho-home catalogo-no-encontrado" role="alert">
          <h2>{textoNoEncontrado}</h2>
          <p>{detalleNoEncontrado}</p>
          <button type="button" className="boton-home primario" onClick={onVolver}>
            <Flecha />
            {textoVolverInicio}
          </button>
        </div>
      </LayoutPublico>
    );
  }

  const estaCargando = tieneFiltros ? cargandoCromos : cargandoMundo;
  const hayError = errorMundo || (tieneFiltros && errorCromos);

  // Índice del mundo (Mundo X de 6)
  const indiceMundo = listaMundos.findIndex((m) => m.id === mundoId);
  const numeroMundo = indiceMundo !== -1 ? indiceMundo + 1 : 1;
  const desde = mundo?.numeros?.desde !== undefined ? String(mundo.numeros.desde).padStart(3, "0") : "001";
  const hasta = mundo?.numeros?.hasta !== undefined ? String(mundo.numeros.hasta).padStart(3, "0") : "020";

  return (
    <LayoutPublico
      destino="/#mundos"
      etiqueta={en ? "Worlds" : "Mundos"}
      descripcion={
        en
          ? "Collect original heroes from six worlds."
          : "Colecciona héroes originales de seis mundos."
      }
      onCuenta={abrirCuenta}
    >
      <div className="ancho-home pagina-catalogo-layout">
        {/* Breadcrumb superior */}
        <nav className="catalogo-breadcrumb" aria-label="Breadcrumb">
          <button
            type="button"
            className="breadcrumb-link"
            onClick={onVolver}
          >
            {tAlbum.breadcrumbInicio || (en ? "Home" : "Inicio")}
          </button>
          <span className="breadcrumb-separador">›</span>
          <span className="breadcrumb-actual">{mundo?.nombre || mundoId}</span>
        </nav>

        {/* Encabezado morado/acento */}
        <header className="catalogo-hero-encabezado">
          <button
            type="button"
            className="catalogo-boton-volver-movil"
            onClick={onVolver}
            aria-label={en ? "Back to home" : "Volver al inicio"}
          >
            <svg
              className="icono-flecha-volver"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
          </button>
          <div className="catalogo-hero-titulos">
            <h1>{mundo?.nombre || "Cromoverso"}</h1>
            <p>
              {en
                ? `World ${numeroMundo} of 6 · cards ${desde} to ${hasta}.`
                : `Mundo ${numeroMundo} de 6 · cromos ${desde} a ${hasta}.`}
            </p>
          </div>
        </header>

        {/* Desplegables tipo chip para móvil (<= 640px) */}
        <div className="catalogo-filtros-movil" aria-label={en ? "Mobile filters" : "Filtros móviles"}>
          <div className="filtro-chip-movil">
            <label htmlFor="filtro-movil-rareza" className="sr-only">
              {en ? "Rarity" : "Rareza"}
            </label>
            <select
              id="filtro-movil-rareza"
              className="select-chip-movil"
              value={filtroRareza}
              onChange={(e) => actualizarFiltros(e.target.value, filtroTipo)}
            >
              <option value="">{en ? "Rarity: all" : "Rareza: todas"}</option>
              {rarezasOrdenadas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-chip-movil">
            <label htmlFor="filtro-movil-tipo" className="sr-only">
              {en ? "Type" : "Tipo"}
            </label>
            <select
              id="filtro-movil-tipo"
              className="select-chip-movil"
              value={filtroTipo}
              onChange={(e) => actualizarFiltros(filtroRareza, e.target.value)}
            >
              <option value="">{en ? "Type: all" : "Tipo: todos"}</option>
              <option value="heroe">{en ? "Hero" : "Héroe"}</option>
              <option value="aliado">{en ? "Ally" : "Aliado"}</option>
              <option value="villano">{en ? "Villain" : "Villano"}</option>
            </select>
          </div>
        </div>

        {/* Layout de dos columnas: Sidebar + Grid */}
        <div className="catalogo-dos-columnas">
          {/* Sidebar izquierdo (3 bloques con borde y radio) */}
          <aside className="catalogo-sidebar" aria-label={en ? "Sidebar filters and worlds" : "Mundos y filtros"}>
            {/* Bloque 1 — Mundos */}
            <div className="catalogo-sidebar-bloque">
              <h3>{tAlbum.mundosTitulo || (en ? "Worlds" : "Mundos")}</h3>
              <ul className="lista-sidebar-mundos">
                {listaMundos.map((m) => {
                  const esActivo = m.id === mundoId;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        className={`fila-sidebar-mundo ${esActivo ? "activo" : ""}`}
                        onClick={() => {
                          if (!esActivo && onNavegarMundo) {
                            onNavegarMundo(m.id);
                          }
                        }}
                      >
                        <span
                          className="punto-color-mundo"
                          style={{ backgroundColor: m.color || "#7b48ff" }}
                        />
                        <span className="nombre-sidebar-mundo">{m.nombre}</span>
                        {esActivo ? (
                          <span className="badge-pagina-actual">
                            {tAlbum.paginaActual || (en ? "Current page" : "Página actual")}
                          </span>
                        ) : (
                          <span className="total-sidebar-cromos">
                            {m.totalCromos || 20} {en ? "cards" : "cromos"}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bloque 2 — Filtrar por rareza */}
            <div className="catalogo-sidebar-bloque">
              <h3>{tAlbum.filtrarRareza || (en ? "Filter by rarity" : "Filtrar por rareza")}</h3>
              <ul className="lista-sidebar-filtros">
                {rarezasOrdenadas.map((r) => {
                  const activa = filtroRareza?.toLowerCase() === r.id;
                  const conteo =
                    mundo?.porRareza?.[r.id] ??
                    mundo?.porRareza?.[r.nombre?.toLowerCase()] ??
                    0;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        className={`fila-sidebar-filtro ${activa ? "activo" : ""}`}
                        aria-pressed={activa}
                        onClick={() => alternarRareza(r.id)}
                      >
                        <span
                          className="icono-filtro-rareza"
                          style={{ backgroundColor: r.color }}
                        >
                          <IconoMundo nombre={r.icono} />
                        </span>
                        <span
                          className="badge-rareza-nombre"
                          style={{ "--color-rareza-badge": r.color }}
                        >
                          {r.nombre}
                        </span>
                        <span className="conteo-filtro-badge">{conteo}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bloque 3 — Filtrar por tipo */}
            <div className="catalogo-sidebar-bloque">
              <h3>{tAlbum.filtrarTipo || (en ? "Filter by type" : "Filtrar por tipo")}</h3>
              <ul className="lista-sidebar-filtros">
                {[
                  { id: "heroe", nombre: en ? "Hero" : "Héroe", conteo: conteoTipos.heroe },
                  { id: "aliado", nombre: en ? "Ally" : "Aliado", conteo: conteoTipos.aliado },
                  { id: "villano", nombre: en ? "Villain" : "Villano", conteo: conteoTipos.villano },
                ].map((t) => {
                  const activo = filtroTipo === t.id;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`fila-sidebar-filtro ${activo ? "activo" : ""}`}
                        aria-pressed={activo}
                        onClick={() => alternarTipo(t.id)}
                      >
                        <span className="nombre-filtro-tipo">{t.nombre}</span>
                        <span className="conteo-filtro-badge">{t.conteo}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Contenido principal: Barra superior de orden + Grid */}
          <main className="catalogo-contenido-principal">
            {/* Barra superior del grid: selector de orden */}
           <div className="catalogo-barra-superior">
            <label htmlFor="selector-orden-cromos" className="etiqueta-orden">
              {typeof tAlbum.orden === "object"
                ? (tAlbum.orden?.etiqueta || (en ? "Order:" : "Orden:")).replace(" {orden}", "")
                : tAlbum.orden || (en ? "Order:" : "Orden:")}
            </label>
              <select
                id="selector-orden-cromos"
                className="select-orden-cromos"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="numero">{tAlbum.ordenNumero || (en ? "Number" : "Número")}</option>
                <option value="nombre">{tAlbum.ordenNombre || (en ? "Name" : "Nombre")}</option>
              </select>
            </div>

            {/* Estados de Carga, Error, Vacío o Grid */}
            {estaCargando ? (
              <div
                className="grid-catalogo-cromos esqueletos-grid"
                aria-busy="true"
                role="status"
              >
                <div className="catalogo-cargando-aviso" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "12px 0 16px" }}>
                  <h2 style={{ font: "700 18px var(--fuente-titulos)", color: "var(--tinta)", margin: 0 }}>
                    {textoCargando}
                  </h2>
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="cromo-esqueleto" aria-hidden="true">
                    <div className="esqueleto-imagen" />
                    <div className="esqueleto-linea corta" />
                    <div className="esqueleto-linea" />
                  </div>
                ))}
              </div>
            ) : hayError ? (
              <div className="catalogo-estado-mensaje error" role="alert">
                <h2>{tituloError}</h2>
                {detalleError && detalleError !== tituloError && <p>{detalleError}</p>}
                <button
                  type="button"
                  className="boton-home primario"
                  onClick={() => {
                    recargarMundo();
                    if (tieneFiltros) recargarCromos();
                  }}
                >
                  {textoReintentar}
                </button>
              </div>
            ) : cromosAvanzados.length === 0 ? (
              <div className="catalogo-estado-mensaje vacio" role="status">
                <p>{textoVacio}</p>
                <button
                  type="button"
                  className="boton-home secundario"
                  onClick={limpiarFiltros}
                >
                  {textoLimpiarFiltros}
                </button>
              </div>
            ) : (
              <div className="grid-catalogo-cromos">
                {cromosAvanzados.map((cromo) => (
                  <TarjetaCromo
                    key={cromo.numero || cromo.id}
                    heroe={cromo}
                    mundo={{
                      nombre: mundo?.nombre || "",
                      color: cromo.ilustracion?.colorBase || mundo?.color || "#7b48ff",
                      icono: cromo.ilustracion?.figura || mundo?.figura || mundo?.icono || "estrella",
                    }}
                    en={en}
                    rarezas={rarezasOrdenadas}
                    onClick={() => abrirDetalleCromo(cromo)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
        <DetalleCromo
          cromoId={cromoId}
          cromosMundo={mundo?.cromos || []}
          rarezas={rarezasApi}
          en={en}
          onCambiar={onCambiarCromo}
          onCerrar={onCerrarCromo}
        />
      </div>
    </LayoutPublico>
  );
}
