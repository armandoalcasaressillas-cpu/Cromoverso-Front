import Marca from "../Marca/Marca.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import { useSesion } from "../../context/SesionContext.jsx";
import "./Footer.css";

export default function Footer({
  nombre,
  tipo,
  descripcion,
  destino,
  etiqueta,
  onCuenta,
  idioma,
  onAbrirCookies,
}) {
  const { textos } = useTextos();
  const { usuario, cerrarSesion } = useSesion();

  const tFooter = textos?.footer || {};
  const t = { ...textos, ...tFooter };

  const textoCerrarSesion =
    tFooter.cerrarSesion ||
    t.cerrarSesion ||
    (idioma === "en" ? "Log out" : "Cerrar sesión");

  const textoCookies =
    typeof t.cookies === "string"
      ? t.cookies
      : typeof t.cookies?.titulo === "string"
        ? t.cookies.titulo
        : typeof tFooter.cookies === "string"
          ? tFooter.cookies
          : idioma === "en"
            ? "Cookie preferences"
            : "Preferencias de cookies";

  return (
    <footer className="pie-home">
      <div className="ancho-home">
        <div className="columnas-pie">
          <div>
            <Marca nombre={nombre} tipo={tipo} />
            <p>{descripcion}</p>
          </div>
          <div>
            <h3>{t.explora}</h3>
            <a href={destino?.startsWith("#") ? "#contenido" : "/"}>
              {t.inicio}
            </a>
            <a href={destino}>{etiqueta}</a>
          </div>
          <div>
            <h3>{t.cuenta}</h3>
            {usuario ? (
              <>
                <p className="usuario-pie-nombre" style={{ margin: "4px 0", fontWeight: "bold" }}>
                  {usuario.nombre}
                </p>
                <button type="button" onClick={cerrarSesion}>
                  {textoCerrarSesion}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => onCuenta("ingresar")}>
                  {t.ingresar}
                </button>
                <button type="button" onClick={() => onCuenta("registro")}>
                  {t.registro}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="pie-creditos">
          <span>
            © 2026 {nombre} · {t.academico}
          </span>
          <button type="button" className="enlace-home" onClick={onAbrirCookies}>
            {textoCookies}
          </button>
        </div>
      </div>
    </footer>
  );
}
