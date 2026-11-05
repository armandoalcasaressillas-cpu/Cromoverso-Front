import { useRef, useState } from "react";
import { proyecto } from "../../config/proyecto.js";
import { usePreferencias } from "../../context/PreferenciasContext.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import SaltarContenido from "../SaltarContenido/SaltarContenido.jsx";
import GestorCookies from "../GestorCookies/GestorCookies.jsx";
import Accesibilidad from "../Accesibilidad/Accesibilidad.jsx";
import "./LayoutPublico.css";

export default function LayoutPublico({
  destino,
  etiqueta,
  descripcion,
  onCuenta,
  children,
}) {
  const { idioma, cambiarIdioma } = usePreferencias();
  const { textos } = useTextos();
  const [cookiesAbiertas, setCookiesAbiertas] = useState(false);
  const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);
  const disparadorCookies = useRef(null);
  const disparadorAccesibilidad = useRef(null);

  function abrirCookies() {
    disparadorCookies.current = document.activeElement;
    setCookiesAbiertas(true);
  }

  function cerrarCookies() {
    setCookiesAbiertas(false);
    disparadorCookies.current?.focus();
  }

  function abrirAccesibilidad() {
    disparadorAccesibilidad.current = document.activeElement;
    setAccesibilidadAbierta(true);
  }

  function cerrarAccesibilidad() {
    setAccesibilidadAbierta(false);
    disparadorAccesibilidad.current?.focus();
  }

  const textoSaltar =
    textos?.saltar ||
    textos?.navbar?.saltar ||
    (idioma === "en" ? "Skip to content" : "Saltar al contenido");

  return (
    <div className={`landing ${proyecto.id}`}>
      <SaltarContenido texto={textoSaltar} />
      <Navbar
        nombre={proyecto.nombre}
        tipo={proyecto.id}
        idioma={idioma}
        onCambiarIdioma={cambiarIdioma}
        destino={destino}
        etiqueta={etiqueta}
        onCuenta={onCuenta}
        onAbrirAccesibilidad={abrirAccesibilidad}
        botonAccesibilidadRef={disparadorAccesibilidad}
      />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <Footer
        nombre={proyecto.nombre}
        tipo={proyecto.id}
        idioma={idioma}
        descripcion={descripcion}
        destino={destino}
        etiqueta={etiqueta}
        onCuenta={onCuenta}
        onAbrirCookies={abrirCookies}
      />
      <GestorCookies
        abierto={cookiesAbiertas}
        onAbrir={abrirCookies}
        onCerrar={cerrarCookies}
      />
      <Accesibilidad
        abierto={accesibilidadAbierta}
        onCerrar={cerrarAccesibilidad}
        botonDisparadorRef={disparadorAccesibilidad}
      />
    </div>
  );
}
