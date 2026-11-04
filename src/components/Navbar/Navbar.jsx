import { useId, useRef, useState } from "react";
import Marca from "../Marca/Marca.jsx";
import MenuMovil from "../MenuMovil/MenuMovil.jsx";
import SelectorIdioma from "../SelectorIdioma/SelectorIdioma.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import { useSesion } from "../../context/SesionContext.jsx";
import "./Navbar.css";

export default function Navbar({
  nombre,
  tipo,
  idioma,
  onCambiarIdioma,
  destino,
  etiqueta,
  onCuenta,
  onAbrirAccesibilidad,
  botonAccesibilidadRef,
}) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef(null);
  const id = useId();
  const { textos } = useTextos();
  const { usuario, cerrarSesion } = useSesion();

  const tNavbar = textos?.navbar || {};
  const tMenuMovil = textos?.menuMovil || {};
  const tA11y = textos?.accesibilidad || {};
  const t = { ...textos, ...tNavbar };

  const textoCerrarSesion =
    tNavbar.cerrarSesion ||
    t.cerrarSesion ||
    (idioma === "en" ? "Log out" : "Cerrar sesión");

  const textosMenu = {
    abrirMenu: tMenuMovil.abrirMenu || t.abrirMenu,
    cerrarMenu: tMenuMovil.cerrarMenu || t.cerrarMenu,
  };

  const etiquetaIdioma =
    typeof textos?.idioma === "string" ? textos.idioma : t.idioma || "Idioma";

  const textoAccesibilidad =
    tA11y.boton || t.accesibilidad || (idioma === "en" ? "Accessibility" : "Accesibilidad");

  return (
    <header
      className="cabecera-home"
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && abierto) {
          setAbierto(false);
          boton.current?.focus();
        }
      }}
    >
      <div className="ancho-home fila-cabecera">
        <Marca nombre={nombre} tipo={tipo} />

        {usuario ? (
          <button
            type="button"
            className="ingreso-movil"
            onClick={cerrarSesion}
            title={usuario.nombre}
          >
            {textoCerrarSesion}
          </button>
        ) : (
          <button
            type="button"
            className="ingreso-movil"
            onClick={() => onCuenta("ingresar")}
          >
            {t.ingresar}
          </button>
        )}

        <MenuMovil
          abierto={abierto}
          onAlternar={() => setAbierto(!abierto)}
          menuId={id}
          botonRef={boton}
          textos={textosMenu}
        />

        <nav
          id={id}
          className={`menu-home ${abierto ? "abierto" : ""}`}
          aria-label={t.navegacion}
        >
          <a
            href={destino?.startsWith("#") ? "#contenido" : "/"}
            aria-current="page"
            onClick={() => setAbierto(false)}
          >
            {t.inicio}
          </a>
          <a href={destino} onClick={() => setAbierto(false)}>
            {etiqueta}
          </a>
          <div className="acciones-home">
            {tipo === "taquilla" && (
              <a
                className="buscar-cabecera"
                href="#buscador-eventos"
                onClick={() => setAbierto(false)}
              >
                {t.buscar}
              </a>
            )}

            {onAbrirAccesibilidad && (
              <button
                type="button"
                ref={botonAccesibilidadRef}
                className="boton-accesibilidad"
                aria-label={textoAccesibilidad}
                onClick={() => {
                  setAbierto(false);
                  onAbrirAccesibilidad();
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="4" r="2" />
                  <path d="M12 7c-3 0-5 2-5 5h3v7h4v-7h3c0-3-2-5-5-5z" />
                </svg>
              </button>
            )}

            <SelectorIdioma
              idioma={idioma}
              onCambiar={onCambiarIdioma}
              etiqueta={etiquetaIdioma}
            />

            {usuario ? (
              <div className="bloque-sesion-nav">
                <span className="usuario-sesion-nombre" title={usuario.correo}>
                  {usuario.nombre}
                </span>
                <button
                  type="button"
                  className="boton-home secundario boton-cerrar-sesion"
                  onClick={() => {
                    setAbierto(false);
                    cerrarSesion();
                  }}
                >
                  {textoCerrarSesion}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="ingresar-home"
                  onClick={() => {
                    setAbierto(false);
                    onCuenta("ingresar");
                  }}
                >
                  {t.ingresar}
                </button>
                <button
                  type="button"
                  className="boton-home primario"
                  onClick={() => {
                    setAbierto(false);
                    onCuenta("registro");
                  }}
                >
                  {t.registro}
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
