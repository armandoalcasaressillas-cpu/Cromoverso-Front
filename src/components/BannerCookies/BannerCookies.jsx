import "./BannerCookies.css";

export default function BannerCookies({
  textos = {},
  onAceptar,
  onRechazar,
  onConfigurar,
}) {
  const tituloBanner =
    typeof textos.banner === "string"
      ? textos.banner
      : typeof textos.banner?.titulo === "string"
        ? textos.banner.titulo
        : "Preferencias del navegador";

  const descripcion =
    typeof textos.descripcion === "string"
      ? textos.descripcion
      : typeof textos.banner?.descripcion === "string"
        ? textos.banner.descripcion
        : "";

  const aceptar =
    typeof textos.aceptar === "string" ? textos.aceptar : "Aceptar preferencias";
  const rechazar =
    typeof textos.rechazar === "string" ? textos.rechazar : "Rechazar opcionales";
  const configurar =
    typeof textos.configurar === "string" ? textos.configurar : "Configurar";

  return (
    <aside className="banner-cookies" aria-label={tituloBanner}>
      <h2>{tituloBanner}</h2>
      <p>{descripcion}</p>
      <div className="grupo-botones">
        <button type="button" className="boton-home primario" onClick={onAceptar}>
          {aceptar}
        </button>
        <button type="button" className="boton-home secundario" onClick={onRechazar}>
          {rechazar}
        </button>
        <button type="button" className="enlace-home" onClick={onConfigurar}>
          {configurar}
        </button>
      </div>
    </aside>
  );
}
