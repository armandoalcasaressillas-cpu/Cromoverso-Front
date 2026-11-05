import IconoMundo from "../IconoMundo/IconoMundo.jsx";
import "./TarjetaMundo.css";

export default function TarjetaMundo({ mundo, i, en, onSeleccionar }) {
  const iconoNombre = mundo?.icono || mundo?.figura || "estrella";
  const etiquetaTotal = mundo?.totalCromos
    ? `${mundo.totalCromos} ${en ? "cards" : "cromos"}`
    : en
      ? "20 cards"
      : "20 cromos";
  const rangoNumeros = mundo?.numeros
    ? `${mundo.numeros.desde}–${mundo.numeros.hasta}`
    : null;

  return (
    <button
      type="button"
      className="tarjeta-mundo"
      style={{
        "--mundo": mundo?.color || "#7b48ff",
        "--fondo-mundo": mundo?.fondo || `${mundo?.color || "#7b48ff"}18`,
      }}
      onClick={() => onSeleccionar(mundo)}
    >
      <span className="icono-mundo">
        <IconoMundo nombre={iconoNombre} />
      </span>
      {i === 0 && (
        <span className="etiqueta-mundo">{en ? "World 1" : "Mundo 1"}</span>
      )}
      <b>{mundo?.nombre}</b>
      <small>{etiquetaTotal}</small>
      {rangoNumeros && (
        <span className="rango-numeros" aria-label={`${en ? "Cards" : "Cromos"} ${rangoNumeros}`}>
          № {rangoNumeros}
        </span>
      )}
    </button>
  );
}
