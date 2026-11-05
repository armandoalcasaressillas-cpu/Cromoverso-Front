import { useEffect, useId, useRef, useState } from "react";
import { useTextos } from "../../context/TextosContext.jsx";
import "./Accesibilidad.css";

function obtenerTextoSeguro(valor, fallback = "") {
  if (typeof valor === "string") return valor;
  if (valor && typeof valor === "object") {
    if (typeof valor.titulo === "string") return valor.titulo;
    if (typeof valor.nombre === "string") return valor.nombre;
    if (typeof valor.descripcion === "string") return valor.descripcion;
  }
  return fallback;
}

function Toggle({ id, activo, onChange, etiqueta, descripcion, textoActivado, textoDesactivado }) {
  const etiquetaSegura = obtenerTextoSeguro(etiqueta);
  const descripcionSegura = obtenerTextoSeguro(descripcion);
  const activadoSeguro = obtenerTextoSeguro(textoActivado, "Activado");
  const desactivadoSeguro = obtenerTextoSeguro(textoDesactivado, "Desactivado");

  return (
    <div className="opcion-a11y">
      <div>
        <label htmlFor={id}>
          <b>{etiquetaSegura}</b>
        </label>
        <p>{descripcionSegura}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={() => onChange(!activo)}
        className={`switch-a11y ${activo ? "activo" : ""}`}
      >
        <span className="solo-lectores">
          {activo ? activadoSeguro : desactivadoSeguro}
        </span>
      </button>
    </div>
  );
}

export default function Accesibilidad({ abierto, onCerrar, botonDisparadorRef }) {
  const { textos, idioma } = useTextos();
  const en = idioma === "en";
  const tA11y = textos?.accesibilidad || {};
  const idModal = useId();
  const dialogoRef = useRef(null);

  // Estados locales sincronizados con localStorage
  const [tamanoFuente, setTamanoFuente] = useState(() => {
    return localStorage.getItem("cromoverso_a11y_fuente_modo") || "normal";
  });
  const [altoContraste, setAltoContraste] = useState(() => {
    return localStorage.getItem("cromoverso_a11y_contraste") === "1";
  });
  const [sinMovimiento, setSinMovimiento] = useState(() => {
    return localStorage.getItem("cromoverso_a11y_movimiento") === "1";
  });
  const [subrayarEnlaces, setSubrayarEnlaces] = useState(() => {
    return localStorage.getItem("cromoverso_a11y_subrayado") === "1";
  });
  const [lecturaFacil, setLecturaFacil] = useState(() => {
    return localStorage.getItem("cromoverso_a11y_lectura") === "1";
  });

  // Persistencia al montar
  useEffect(() => {
    const fuente = localStorage.getItem("cromoverso_a11y_fuente");
    if (fuente) document.documentElement.style.fontSize = fuente;
    if (localStorage.getItem("cromoverso_a11y_contraste") === "1") {
      document.documentElement.classList.add("alto-contraste");
    }
    if (localStorage.getItem("cromoverso_a11y_movimiento") === "1") {
      document.documentElement.classList.add("sin-movimiento");
    }
    if (localStorage.getItem("cromoverso_a11y_subrayado") === "1") {
      document.documentElement.classList.add("subrayar-enlaces");
    }
    if (localStorage.getItem("cromoverso_a11y_lectura") === "1") {
      document.documentElement.classList.add("lectura-facil");
    }
  }, []);

  // Manejo de apertura y cierre con foco y tecla Escape
  useEffect(() => {
    const el = dialogoRef.current;
    if (!el) return;

    if (abierto) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [abierto]);

  function manejarCerrar() {
    onCerrar();
    botonDisparadorRef?.current?.focus();
  }

  // 1. Tamaño del texto
  function cambiarTamanoTexto(valor) {
    setTamanoFuente(valor);
    const fontSizeMap = {
      normal: "",
      grande: "112.5%",
      "muy-grande": "125%",
    };
    const estilo = fontSizeMap[valor] || "";
    document.documentElement.style.fontSize = estilo;
    if (estilo) {
      localStorage.setItem("cromoverso_a11y_fuente", estilo);
      localStorage.setItem("cromoverso_a11y_fuente_modo", valor);
    } else {
      localStorage.removeItem("cromoverso_a11y_fuente");
      localStorage.removeItem("cromoverso_a11y_fuente_modo");
    }
  }

  // 2. Alto contraste
  function cambiarAltoContraste(valor) {
    setAltoContraste(valor);
    document.documentElement.classList.toggle("alto-contraste", valor);
    if (valor) {
      localStorage.setItem("cromoverso_a11y_contraste", "1");
    } else {
      localStorage.removeItem("cromoverso_a11y_contraste");
    }
  }

  // 3. Reducir movimiento
  function cambiarSinMovimiento(valor) {
    setSinMovimiento(valor);
    document.documentElement.classList.toggle("sin-movimiento", valor);
    if (valor) {
      localStorage.setItem("cromoverso_a11y_movimiento", "1");
    } else {
      localStorage.removeItem("cromoverso_a11y_movimiento");
    }
  }

  // 4. Subrayar enlaces
  function cambiarSubrayarEnlaces(valor) {
    setSubrayarEnlaces(valor);
    document.documentElement.classList.toggle("subrayar-enlaces", valor);
    if (valor) {
      localStorage.setItem("cromoverso_a11y_subrayado", "1");
    } else {
      localStorage.removeItem("cromoverso_a11y_subrayado");
    }
  }

  // 5. Fuente para lectura fácil
  function cambiarLecturaFacil(valor) {
    setLecturaFacil(valor);
    document.documentElement.classList.toggle("lectura-facil", valor);
    if (valor) {
      localStorage.setItem("cromoverso_a11y_lectura", "1");
    } else {
      localStorage.removeItem("cromoverso_a11y_lectura");
    }
  }

  // 7. Botón "Restablecer"
  function restablecer() {
    document.documentElement.style.fontSize = "";
    ["alto-contraste", "sin-movimiento", "subrayar-enlaces", "lectura-facil"].forEach(
      (c) => document.documentElement.classList.remove(c),
    );
    ["fuente", "fuente_modo", "contraste", "movimiento", "subrayado", "lectura"].forEach(
      (k) => localStorage.removeItem(`cromoverso_a11y_${k}`),
    );
    setTamanoFuente("normal");
    setAltoContraste(false);
    setSinMovimiento(false);
    setSubrayarEnlaces(false);
    setLecturaFacil(false);
  }

  const textoTitulo = obtenerTextoSeguro(tA11y.titulo, en ? "Accessibility" : "Accesibilidad");
  const textoCerrar = obtenerTextoSeguro(tA11y.cerrar, en ? "Close accessibility" : "Cerrar accesibilidad");
  const textoTamano = obtenerTextoSeguro(tA11y.tamanoTexto || tA11y.tamano, en ? "Text size" : "Tamaño del texto");
  const textoNormal = obtenerTextoSeguro(tA11y.normal, "Normal");
  const textoGrande = obtenerTextoSeguro(tA11y.grande, en ? "Large" : "Grande");
  const textoMuyGrande = obtenerTextoSeguro(tA11y.muyGrande, en ? "Extra large" : "Muy grande");
  const textoAltoContraste = obtenerTextoSeguro(tA11y.altoContraste, en ? "High contrast" : "Alto contraste");
  const descAltoContraste = obtenerTextoSeguro(
    tA11y.altoContrasteDesc,
    en
      ? "Increases color contrast to enhance readability."
      : "Aumenta el contraste de colores para mejorar la legibilidad.",
  );
  const textoReducirMov = obtenerTextoSeguro(tA11y.reducirMovimiento, en ? "Reduce motion" : "Reducir movimiento");
  const descReducirMov = obtenerTextoSeguro(
    tA11y.reducirMovimientoDesc,
    en
      ? "Disables non-essential animations and transitions."
      : "Desactiva animaciones y transiciones no esenciales.",
  );
  const textoSubrayar = obtenerTextoSeguro(tA11y.subrayarEnlaces, en ? "Underline links" : "Subrayar enlaces");
  const descSubrayar = obtenerTextoSeguro(
    tA11y.subrayarEnlacesDesc,
    en
      ? "Adds a permanent underline to all links."
      : "Añade un subrayado permanente a todos los enlaces.",
  );
  const textoLectura = obtenerTextoSeguro(tA11y.fuenteLectura, en ? "Easy reading font" : "Fuente para lectura fácil");
  const descLectura = obtenerTextoSeguro(
    tA11y.fuenteLecturaDesc,
    en
      ? "Uses a sans-serif typeface optimized for reading."
      : "Usa una tipografía sin serifa optimizada para lectura.",
  );
  const textoDeclaracion = obtenerTextoSeguro(
    tA11y.declaracion,
    en ? "Accessibility statement" : "Declaración de accesibilidad",
  );
  const textoRestablecer = obtenerTextoSeguro(tA11y.restablecer, en ? "Reset" : "Restablecer");
  const textoActivado = obtenerTextoSeguro(tA11y.activado, en ? "Enabled" : "Activado");
  const textoDesactivado = obtenerTextoSeguro(tA11y.desactivado, en ? "Disabled" : "Desactivado");

  return (
    <dialog
      ref={dialogoRef}
      className="dialogo-accesibilidad"
      aria-labelledby={idModal}
      aria-modal="true"
      onClose={manejarCerrar}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          manejarCerrar();
        }
      }}
    >
      <div className="cabecera-modal-a11y">
        <h2 id={idModal}>{textoTitulo}</h2>
        <button
          type="button"
          className="boton-cerrar-a11y"
          aria-label={textoCerrar}
          onClick={manejarCerrar}
        >
          ✕
        </button>
      </div>

      <div className="cuerpo-modal-a11y">
        {/* 1. Tamaño del texto */}
        <section className="seccion-tamano-texto">
          <b>{textoTamano}</b>
          <div className="chips-tamano-a11y" role="group" aria-label={textoTamano}>
            <button
              type="button"
              className={`chip-tamano ${tamanoFuente === "normal" ? "activo" : ""}`}
              aria-pressed={tamanoFuente === "normal"}
              onClick={() => cambiarTamanoTexto("normal")}
            >
              {textoNormal}
            </button>
            <button
              type="button"
              className={`chip-tamano ${tamanoFuente === "grande" ? "activo" : ""}`}
              aria-pressed={tamanoFuente === "grande"}
              onClick={() => cambiarTamanoTexto("grande")}
            >
              {textoGrande}
            </button>
            <button
              type="button"
              className={`chip-tamano ${tamanoFuente === "muy-grande" ? "activo" : ""}`}
              aria-pressed={tamanoFuente === "muy-grande"}
              onClick={() => cambiarTamanoTexto("muy-grande")}
            >
              {textoMuyGrande}
            </button>
          </div>
        </section>

        {/* 2. Alto contraste */}
        <Toggle
          id="toggle-alto-contraste"
          activo={altoContraste}
          onChange={cambiarAltoContraste}
          etiqueta={textoAltoContraste}
          descripcion={descAltoContraste}
          textoActivado={textoActivado}
          textoDesactivado={textoDesactivado}
        />

        {/* 3. Reducir movimiento */}
        <Toggle
          id="toggle-reducir-movimiento"
          activo={sinMovimiento}
          onChange={cambiarSinMovimiento}
          etiqueta={textoReducirMov}
          descripcion={descReducirMov}
          textoActivado={textoActivado}
          textoDesactivado={textoDesactivado}
        />

        {/* 4. Subrayar enlaces */}
        <Toggle
          id="toggle-subrayar-enlaces"
          activo={subrayarEnlaces}
          onChange={cambiarSubrayarEnlaces}
          etiqueta={textoSubrayar}
          descripcion={descSubrayar}
          textoActivado={textoActivado}
          textoDesactivado={textoDesactivado}
        />

        {/* 5. Fuente para lectura fácil */}
        <Toggle
          id="toggle-lectura-facil"
          activo={lecturaFacil}
          onChange={cambiarLecturaFacil}
          etiqueta={textoLectura}
          descripcion={descLectura}
          textoActivado={textoActivado}
          textoDesactivado={textoDesactivado}
        />

        {/* 6. Enlace "Declaración de accesibilidad" */}
        <div className="declaracion-a11y-bloque">
          <a href="#" className="enlace-home" onClick={(e) => e.preventDefault()}>
            {textoDeclaracion}
          </a>
        </div>

        {/* 7. Botón "Restablecer" */}
        <div className="acciones-a11y-pie">
          <button
            type="button"
            className="boton-home secundario boton-restablecer-a11y"
            onClick={restablecer}
          >
            {textoRestablecer}
          </button>
        </div>
      </div>
    </dialog>
  );
}
