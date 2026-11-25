import { useEffect, useId, useRef } from "react";
import IlustracionCromo from "../IlustracionCromo/IlustracionCromo.jsx";
import IconoMundo from "../IconoMundo/IconoMundo.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import { useRecurso } from "../../hooks/useRecurso.js";
import { interpolar } from "../../utils/navegacion.js";
import { obtenerTextoSeguro } from "../../utils/textos.js";
import "./DetalleCromo.css";

const ATRIBUTOS = ["fuerza", "velocidad", "mente", "energia"];
const ESCALA_MAXIMA = 99;

const RAREZAS_RESPALDO = {
  legendaria: { es: "Legendaria", en: "Legendary", icono: "corona", color: "#f59e0b" },
  epica: { es: "Épica", en: "Epic", icono: "estrella", color: "#8b5cf6" },
  rara: { es: "Rara", en: "Rare", icono: "rombo", color: "#3b82f6" },
  comun: { es: "Común", en: "Common", icono: "circulo", color: "#64748b" },
};

const TIPOS_RESPALDO = {
  heroe: { es: "Héroe", en: "Hero" },
  aliado: { es: "Aliado", en: "Ally" },
  villano: { es: "Villano", en: "Villain" },
};

/**
 * Vista 3 · Detalle de un cromo.
 * Modal (dialog nativo) que se abre encima del catálogo con GET /cromos/:id.
 * En móvil se muestra como hoja inferior.
 */
export default function DetalleCromo({
  cromoId,
  cromosMundo = [],
  rarezas = [],
  en = false,
  onCambiar,
  onCerrar,
}) {
  const dialogo = useRef(null);
  const idTitulo = useId();
  const { textos } = useTextos();
  const t = textos?.paginas?.detalleCromo || {};

  const {
    datos: cromo,
    error,
    cargando,
    recargar,
  } = useRecurso(cromoId ? `/cromos/${encodeURIComponent(cromoId)}` : null);

  // Abrir / cerrar el dialog nativo según haya cromo seleccionado
  useEffect(() => {
    const nodo = dialogo.current;
    if (!nodo) return;
    if (cromoId && !nodo.open) nodo.showModal();
    if (!cromoId && nodo.open) nodo.close();
  }, [cromoId]);

  // SEO: título y descripción de la página con nombre y poder (como generateMetadata)
  useEffect(() => {
    if (!cromo) return;
    const tituloAnterior = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const descripcionAnterior = meta?.getAttribute("content");
    document.title = interpolar(t.seo?.titulo || "{nombre} · Cromoverso", {
      nombre: cromo.nombre,
    });
    if (meta) {
      meta.setAttribute(
        "content",
        interpolar(t.seo?.descripcion || "{poder}", { poder: cromo.poder }),
      );
    }
    return () => {
      document.title = tituloAnterior;
      if (meta && descripcionAnterior !== null) {
        meta.setAttribute("content", descripcionAnterior);
      }
    };
  }, [cromo, t.seo?.titulo, t.seo?.descripcion]);

  // Anterior / siguiente dentro del mismo mundo (los 20 cromos en orden)
  const ordenados = [...cromosMundo].sort(
    (a, b) => (a.posicion ?? a.numero) - (b.posicion ?? b.numero),
  );
  const indice = cromo
    ? ordenados.findIndex(
        (c) => String(c.id).toLowerCase() === String(cromo.id).toLowerCase(),
      )
    : -1;
  const anterior = indice > 0 ? ordenados[indice - 1] : null;
  const siguiente =
    indice !== -1 && indice < ordenados.length - 1 ? ordenados[indice + 1] : null;

  function alTeclear(evento) {
    if (evento.target.closest("input, textarea, select")) return;
    if (evento.key === "ArrowLeft" && anterior) onCambiar?.(anterior.id);
    if (evento.key === "ArrowRight" && siguiente) onCambiar?.(siguiente.id);
  }

  function cerrar() {
    dialogo.current?.close();
  }

  // ----- Textos -----
  const idioma = en ? "en" : "es";
  const textoCerrar = obtenerTextoSeguro(t.botones?.cerrar, en ? "Close" : "Cerrar");
  const textoPoder = obtenerTextoSeguro(t.poder?.titulo, en ? "Power" : "Poder");
  const textoAtributos = obtenerTextoSeguro(
    t.atributos?.titulo,
    en ? "Attributes" : "Atributos",
  );
  const textoEscala = obtenerTextoSeguro(
    t.atributos?.escala,
    en ? "Scale from 10 to 99." : "Escala de 10 a 99.",
  );
  const textoAnterior = obtenerTextoSeguro(
    t.navegacion?.anterior,
    en ? "Previous card" : "Cromo anterior",
  );
  const textoSiguiente = obtenerTextoSeguro(
    t.navegacion?.siguiente,
    en ? "Next card" : "Cromo siguiente",
  );
  const textoCargando = obtenerTextoSeguro(
    textos?.estados?.cargando,
    en ? "Loading…" : "Cargando…",
  );
  const textoReintentar = obtenerTextoSeguro(
    textos?.estados?.error?.botones?.reintentar,
    en ? "Retry" : "Reintentar",
  );

  const es404 =
    error && (error.codigo === "no_encontrado" || error.status === 404);

  function textoError() {
    if (!error) return "";
    if (error.codigo === "sin_conexion") {
      return obtenerTextoSeguro(
        textos?.paginas?.ingresar?.errores?.conexion?.texto,
        en
          ? "Check your internet connection and try again."
          : "Revisa tu conexión a internet e inténtalo de nuevo.",
      );
    }
    return obtenerTextoSeguro(
      textos?.errores?.[error.codigo] || textos?.errores?.generico,
      en ? "Something went wrong. Please try again." : "Algo salió mal. Vuelve a intentarlo.",
    );
  }

  // ----- Datos del cromo -----
  const idRareza = String(cromo?.rareza || "").toLowerCase();
  const rarezaApi = rarezas.find((r) => String(r.id).toLowerCase() === idRareza);
  const rarezaResp = RAREZAS_RESPALDO[idRareza] || RAREZAS_RESPALDO.comun;
  const rareza = {
    nombre: rarezaApi?.nombre || rarezaResp[idioma],
    icono: rarezaApi?.icono || rarezaResp.icono,
    color: rarezaApi?.color || rarezaResp.color,
  };
  const idTipo = String(cromo?.tipo || "").toLowerCase();
  const tipo = obtenerTextoSeguro(
    t.encabezado?.tipos?.[idTipo],
    TIPOS_RESPALDO[idTipo]?.[idioma] || cromo?.tipo || "",
  );
  const numero = String(cromo?.numero ?? "").padStart(3, "0");
  const ubicacion = cromo
    ? interpolar(
        t.encabezado?.ubicacion ||
          (en ? "{id} · {mundo}, position {posicion}" : "{id} · {mundo}, posición {posicion}"),
        { id: cromo.id, mundo: cromo.mundoNombre, posicion: cromo.posicion },
      )
    : "";
  const atributos = cromo?.atributos || {};
  const total = ATRIBUTOS.reduce((suma, clave) => suma + (Number(atributos[clave]) || 0), 0);
  const nombreAtributo = (clave) =>
    obtenerTextoSeguro(
      t.atributos?.nombres?.[clave],
      {
        fuerza: en ? "Strength" : "Fuerza",
        velocidad: en ? "Speed" : "Velocidad",
        mente: en ? "Mind" : "Mente",
        energia: en ? "Energy" : "Energía",
      }[clave],
    );

  return (
    <dialog
      ref={dialogo}
      className="detalle-cromo"
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onKeyDown={alTeclear}
      onClick={(evento) => {
        // Clic en el fondo oscuro (fuera de la tarjeta) cierra el modal
        if (evento.target === dialogo.current) cerrar();
      }}
    >
      <div className="detalle-cromo-contenido">
        <span className="detalle-cromo-agarre" aria-hidden="true" />
        <button
          type="button"
          className="detalle-cromo-cerrar"
          aria-label={textoCerrar}
          onClick={cerrar}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {cargando ? (
          <div className="detalle-cromo-estado" role="status" aria-live="polite">
            <span className="detalle-cromo-spinner" aria-hidden="true" />
            <p id={idTitulo}>{textoCargando}</p>
          </div>
        ) : es404 ? (
          <div className="detalle-cromo-estado" role="alert">
            <h2 id={idTitulo}>
              {obtenerTextoSeguro(
                t.noEncontrado?.titulo,
                en ? "We couldn't find this card" : "No encontramos este cromo",
              )}
            </h2>
            <p>
              {obtenerTextoSeguro(
                t.noEncontrado?.texto,
                en ? "The number may be mistyped." : "Puede que el número esté mal escrito.",
              )}
            </p>
            <button type="button" className="boton-home primario" onClick={cerrar}>
              {textoCerrar}
            </button>
          </div>
        ) : error ? (
          <div className="detalle-cromo-estado" role="alert">
            <h2 id={idTitulo}>{textoError()}</h2>
            <button type="button" className="boton-home primario" onClick={recargar}>
              {textoReintentar}
            </button>
          </div>
        ) : cromo ? (
          <>
            <div className="detalle-cromo-cuerpo">
              <figure
                className={`detalle-cromo-carta${cromo.holografico ? " holografica" : ""}`}
                style={{ "--color-rareza": rareza.color }}
                aria-hidden="true"
              >
                <span className="detalle-cromo-numero">{numero}</span>
                <span className="detalle-cromo-icono-rareza">
                  <IconoMundo nombre={rareza.icono} />
                </span>
                <IlustracionCromo
                  mundo={{
                    color: cromo.ilustracion?.colorBase || "#7b48ff",
                    icono: cromo.ilustracion?.figura || "estrella",
                  }}
                />
                <figcaption>
                  <b>{cromo.nombre}</b>
                  <small>
                    {cromo.mundoNombre} · {tipo}
                  </small>
                </figcaption>
              </figure>

              <div className="detalle-cromo-info">
                <ul className="detalle-cromo-chips">
                  <li className="chip-rareza" style={{ "--color-rareza": rareza.color }}>
                    <IconoMundo nombre={rareza.icono} />
                    {rareza.nombre}
                  </li>
                  <li>{cromo.mundoNombre}</li>
                  <li>{tipo}</li>
                </ul>

                <p className="detalle-cromo-ubicacion">{ubicacion}</p>
                <h2 id={idTitulo}>{cromo.nombre}</h2>

                <div className="detalle-cromo-poder">
                  <span className="detalle-cromo-poder-icono" aria-hidden="true">
                    <IconoMundo nombre="destello" />
                  </span>
                  <div>
                    <span className="detalle-cromo-poder-etiqueta">{textoPoder}</span>
                    <p>{cromo.poder}</p>
                  </div>
                </div>

                <p className="detalle-cromo-descripcion">{cromo.descripcion}</p>

                <section className="detalle-cromo-atributos" aria-labelledby={`${idTitulo}-atr`}>
                  <header>
                    <h3 id={`${idTitulo}-atr`}>{textoAtributos}</h3>
                    <span>
                      {interpolar(t.atributos?.total || "Total {total}", { total })}
                    </span>
                  </header>
                  <dl>
                    {ATRIBUTOS.map((clave) => {
                      const valor = Number(atributos[clave]) || 0;
                      return (
                        <div className="detalle-cromo-atributo" key={clave}>
                          <dt>{nombreAtributo(clave)}</dt>
                          <dd>
                            <span className="barra" aria-hidden="true">
                              <span style={{ width: `${(valor / ESCALA_MAXIMA) * 100}%` }} />
                            </span>
                            <span className="valor">{valor}</span>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  <p className="detalle-cromo-escala">{textoEscala}</p>
                </section>
              </div>
            </div>

            {(anterior || siguiente) && (
              <nav className="detalle-cromo-navegacion" aria-label={en ? "Cards in this world" : "Cromos de este mundo"}>
                {anterior ? (
                  <button
                    type="button"
                    onClick={() => onCambiar?.(anterior.id)}
                    aria-label={`${textoAnterior}: ${String(anterior.numero).padStart(3, "0")} ${anterior.nombre}`}
                  >
                    <span aria-hidden="true">‹</span> {String(anterior.numero).padStart(3, "0")} {anterior.nombre}
                  </button>
                ) : (
                  <span />
                )}
                {siguiente ? (
                  <button
                    type="button"
                    onClick={() => onCambiar?.(siguiente.id)}
                    aria-label={`${textoSiguiente}: ${String(siguiente.numero).padStart(3, "0")} ${siguiente.nombre}`}
                  >
                    {String(siguiente.numero).padStart(3, "0")} {siguiente.nombre} <span aria-hidden="true">›</span>
                  </button>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        ) : null}
      </div>
    </dialog>
  );
}
