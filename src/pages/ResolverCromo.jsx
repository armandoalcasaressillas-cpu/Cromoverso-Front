import { useEffect } from "react";
import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useTextos } from "../context/TextosContext.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { useDetalle } from "../hooks/useDetalle.js";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import { navegar, rutaCromo } from "../utils/navegacion.js";
import { obtenerTextoSeguro } from "../utils/textos.js";

/**
 * Se usa cuando alguien entra directo a /cromos/:id (enlace compartido o recarga).
 * Pide el cromo para saber su mundo y abre el catálogo con el detalle encima.
 * Si la API responde 404 no_encontrado, muestra la página de "no encontrado".
 */
export default function ResolverCromo({ cromoId, onVolver }) {
  const { idioma } = usePreferencias();
  const en = idioma === "en";
  const { textos } = useTextos();
  const { detalle, setDetalle, abrirCuenta } = useDetalle(idioma);
  const t = textos?.paginas?.detalleCromo || {};

  const { datos: cromo, error, cargando, recargar } = useRecurso(
    `/cromos/${encodeURIComponent(cromoId)}`,
  );

  useEffect(() => {
    if (cromo?.mundo) {
      navegar(rutaCromo(cromo.id), {
        reemplazar: true,
        estado: { mundoId: cromo.mundo },
      });
    }
  }, [cromo]);

  const es404 = error && (error.codigo === "no_encontrado" || error.status === 404);

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
      <div className="ancho-home catalogo-no-encontrado" style={{ padding: "80px 0", minHeight: "50vh", textAlign: "center" }}>
        {es404 ? (
          <div role="alert">
            <h1>
              {obtenerTextoSeguro(
                t.noEncontrado?.titulo,
                en ? "We couldn't find this card" : "No encontramos este cromo",
              )}
            </h1>
            <p>
              {obtenerTextoSeguro(
                t.noEncontrado?.texto,
                en ? "The number may be mistyped." : "Puede que el número esté mal escrito.",
              )}
            </p>
            <button type="button" className="boton-home primario" onClick={onVolver}>
              {obtenerTextoSeguro(
                t.noEncontrado?.botones?.volver,
                en ? "Back to the worlds" : "Volver a los mundos",
              )}
            </button>
          </div>
        ) : error ? (
          <div role="alert">
            <h1>
              {obtenerTextoSeguro(
                textos?.errores?.[error.codigo] || textos?.errores?.generico,
                en ? "Something went wrong. Please try again." : "Algo salió mal. Vuelve a intentarlo.",
              )}
            </h1>
            <button type="button" className="boton-home primario" onClick={recargar}>
              {en ? "Retry" : "Reintentar"}
            </button>
          </div>
        ) : (
          <p role="status" aria-busy={cargando}>
            {obtenerTextoSeguro(textos?.estados?.cargando, en ? "Loading…" : "Cargando…")}
          </p>
        )}
      </div>
      <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
    </LayoutPublico>
  );
}
