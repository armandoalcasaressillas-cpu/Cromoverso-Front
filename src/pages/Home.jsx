import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import HeroCromoverso from "../components/HeroCromoverso/HeroCromoverso.jsx";
import SeccionMundos from "../components/SeccionMundos/SeccionMundos.jsx";
import IlustracionCromo from "../components/IlustracionCromo/IlustracionCromo.jsx";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useTextos } from "../context/TextosContext.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { useDetalle } from "../hooks/useDetalle.js";
import { obtenerTextoSeguro } from "../utils/textos.js";

export default function Home({ onVerMundo }) {
  const { idioma } = usePreferencias();
  const en = idioma === "en";
  const { textos } = useTextos();
  const { detalle, setDetalle, abrirCuenta } = useDetalle(idioma);

  // GET /mundos → { datos: [mundo, ...], totalAlbum: 120 }
  const {
    datos: respuestaMundos,
    error: errorMundos,
    cargando: cargandoMundos,
    recargar: recargarMundos,
  } = useRecurso("/mundos");

  // GET /rarezas → { datos: [{ id, nombre, icono, color, porcentaje }] }
  const { datos: respuestaRarezas } = useRecurso("/rarezas");

  const mundos = respuestaMundos?.datos || [];
  const totalAlbum = respuestaMundos?.totalAlbum || 120;
  const primerMundoId = mundos[0]?.id || "neon";

  // GET /mundos/:primerMundoId para los 3 cromos del hero
  const {
    datos: respuestaPrimerMundo,
    error: errorPrimerMundo,
    cargando: cargandoPrimerMundo,
    recargar: recargarPrimerMundo,
  } = useRecurso(primerMundoId ? `/mundos/${primerMundoId}` : null);

  const cromosHero = (respuestaPrimerMundo?.cromos || []).slice(0, 3);

  function abrirMundo(mundo) {
    if (onVerMundo) {
      onVerMundo(mundo.id || mundo);
    } else {
      setDetalle({
        titulo: mundo.nombre,
        descripcion: en
          ? "A world of 20 hero, villain and ally cards."
          : "Un mundo con 20 cromos de héroes, villanos y aliados.",
        cerrar: en ? "Close" : "Cerrar",
      });
    }
  }

  function abrirCromo(cromo) {
    const mundoDelCromo =
      (typeof cromo.mundo === "object" && cromo.mundo !== null)
        ? cromo.mundo
        : mundos.find((m) => m.id === cromo.mundo) || mundos[0] || {};

    setDetalle({
      titulo: cromo.nombre,
      descripcion: `${mundoDelCromo.nombre || ""} · ${cromo.numero}`,
      contenido: (
        <IlustracionCromo
          mundo={{
            color: cromo.ilustracion?.colorBase || mundoDelCromo.color || "#7b48ff",
            icono:
              cromo.ilustracion?.figura ||
              mundoDelCromo.figura ||
              mundoDelCromo.icono ||
              "estrella",
          }}
        />
      ),
      cerrar: en ? "Close" : "Cerrar",
    });
  }

  function recargarTodo() {
    recargarMundos();
    recargarPrimerMundo();
  }

  const tEstados = textos?.estados || {};
  const textoCargando = obtenerTextoSeguro(
    tEstados.cargando,
    en ? "Loading..." : "Cargando...",
  );
  const textoError = obtenerTextoSeguro(
    tEstados.error,
    en
      ? "Unable to load data. Please check your connection."
      : "No se pudieron cargar los datos. Revisa tu conexión.",
  );
  const textoReintentar = obtenerTextoSeguro(
    tEstados.error?.botones?.reintentar || tEstados.reintentar,
    en ? "Retry" : "Reintentar",
  );

  const hayError = errorMundos || (errorPrimerMundo && !respuestaPrimerMundo);
  const estaCargando = cargandoMundos || (!respuestaMundos && cargandoPrimerMundo);

  return (
    <>
      <LayoutPublico
        destino="#mundos"
        etiqueta={en ? "Worlds" : "Mundos"}
        descripcion={
          en
            ? "Collect original heroes from six worlds."
            : "Colecciona héroes originales de seis mundos."
        }
        onCuenta={abrirCuenta}
      >
        {estaCargando ? (
          <div
            className="ancho-home"
            style={{
              padding: "80px 20px",
              textAlign: "center",
              minHeight: "50vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
            aria-busy="true"
            role="status"
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid rgba(113, 59, 250, 0.2)",
                borderTopColor: "var(--acento)",
                borderRadius: "50%",
                animation: "girar 0.8s linear infinite",
              }}
              aria-hidden="true"
            />
            <p style={{ fontSize: "16px", fontWeight: "600" }}>{textoCargando}</p>
            <style>{`@keyframes girar { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : hayError ? (
          <div
            className="ancho-home"
            style={{
              padding: "80px 20px",
              textAlign: "center",
              minHeight: "50vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
            }}
            role="alert"
          >
            <h2>{textoError}</h2>
            <button
              type="button"
              className="boton-home primario"
              onClick={recargarTodo}
            >
              {textoReintentar}
            </button>
          </div>
        ) : (
          <>
            <HeroCromoverso
              en={en}
              heroes={cromosHero}
              mundos={mundos}
              abrirCuenta={abrirCuenta}
              onSeleccionarCromo={abrirCromo}
              totalAlbum={totalAlbum}
            />
            <SeccionMundos
              mundos={mundos}
              en={en}
              abrirMundo={abrirMundo}
            />
          </>
        )}

        <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
      </LayoutPublico>
    </>
  );
}
