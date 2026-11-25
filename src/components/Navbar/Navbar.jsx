import { useEffect, useId, useRef, useState } from "react";
import Marca from "../Marca/Marca.jsx";
import MenuMovil from "../MenuMovil/MenuMovil.jsx";
import SelectorIdioma from "../SelectorIdioma/SelectorIdioma.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import { useSesion } from "../../context/SesionContext.jsx";
import "./Navbar.css";

function iniciales(nombre = "") {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

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
  const [menuCuenta, setMenuCuenta] = useState(false);
  const boton = useRef(null);
  const botonCuenta = useRef(null);
  const contenedorCuenta = useRef(null);
  const id = useId();
  const idMenuCuenta = useId();
  const { textos } = useTextos();
  const { usuario, cerrarSesion } = useSesion();

  const tNavbar = textos?.navbar || {};
  const tMenuMovil = textos?.menuMovil || {};
  const tA11y = textos?.accesibilidad || {};
  const t = { ...textos, ...tNavbar };

  const textoCerrarSesion =
    (typeof tNavbar.usuario?.cerrarSesion === "string" && tNavbar.usuario.cerrarSesion) ||
    (typeof tNavbar.cerrarSesion === "string" && tNavbar.cerrarSesion) ||
    (idioma === "en" ? "Log out" : "Cerrar sesión");
  const textoMenuCuenta =
    (typeof tNavbar.usuario?.menu === "string" && tNavbar.usuario.menu) ||
    (idioma === "en" ? "Your account menu" : "Menú de tu cuenta");

  // Cerrar el menú de la cuenta al hacer clic fuera
  useEffect(() => {
    if (!menuCuenta) return;
    function alHacerClic(evento) {
      if (!contenedorCuenta.current?.contains(evento.target)) setMenuCuenta(false);
    }
    document.addEventListener("pointerdown", alHacerClic);
    return () => document.removeEventListener("pointerdown", alHacerClic);
  }, [menuCuenta]);

  async function salir() {
    setMenuCuenta(false);
    setAbierto(false);
    await cerrarSesion();
    boton.current?.focus();
  }

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
        if (evento.key === "Escape" && menuCuenta) {
          setMenuCuenta(false);
          botonCuenta.current?.focus();
        } else if (evento.key === "Escape" && abierto) {
          setAbierto(false);
          boton.current?.focus();
        }
      }}
    >
      <div className="ancho-home fila-cabecera">
        <Marca nombre={nombre} tipo={tipo} />

        {usuario ? null : (
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
              <>
                {/* Escritorio: avatar con menú desplegable */}
                <div className="cuenta-nav" ref={contenedorCuenta}>
                  <button
                    type="button"
                    ref={botonCuenta}
                    className="cuenta-boton"
                    aria-label={`${textoMenuCuenta}: ${usuario.nombre}`}
                    aria-haspopup="true"
                    aria-expanded={menuCuenta}
                    aria-controls={idMenuCuenta}
                    onClick={() => setMenuCuenta((v) => !v)}
                  >
                    <span className="avatar-nav" aria-hidden="true">
                      {iniciales(usuario.nombre)}
                    </span>
                    <span className="cuenta-nombre" aria-hidden="true">
                      {usuario.nombre.split(" ")[0]}
                    </span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {menuCuenta && (
                    <div className="menu-cuenta" id={idMenuCuenta}>
                      <div className="menu-cuenta-usuario">
                        <span className="avatar-nav pequeno" aria-hidden="true">
                          {iniciales(usuario.nombre)}
                        </span>
                        <div>
                          <b>{usuario.nombre}</b>
                          <small>{usuario.correo}</small>
                        </div>
                      </div>
                      <button type="button" className="menu-cuenta-salir" onClick={salir}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
                        </svg>
                        {textoCerrarSesion}
                      </button>
                    </div>
                  )}
                </div>

                {/* Móvil: bloque de usuario al final del menú */}
                <div className="sesion-movil">
                  <span className="avatar-nav pequeno" aria-hidden="true">
                    {iniciales(usuario.nombre)}
                  </span>
                  <div className="sesion-movil-datos">
                    <b>{usuario.nombre}</b>
                    <small>@{usuario.alias || usuario.correo}</small>
                  </div>
                  <button type="button" className="boton-home secundario sesion-movil-salir" onClick={salir}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
                    </svg>
                    {textoCerrarSesion}
                  </button>
                </div>
              </>
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
