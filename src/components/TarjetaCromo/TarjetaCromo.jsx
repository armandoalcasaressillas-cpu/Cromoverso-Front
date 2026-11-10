import IconoMundo from "../IconoMundo/IconoMundo.jsx";
import IlustracionCromo from "../IlustracionCromo/IlustracionCromo.jsx";
import "./TarjetaCromo.css";

export default function TarjetaCromo({
  heroe,
  mundo,
  onClick,
  en = false,
  rarezas = [],
}) {
  const cromo = heroe || {};

  // Resolver información de la rareza (icono, nombre y color)
  let rarezaIcono = "estrella";
  let rarezaNombre = en ? "Legendary" : "Legendaria";
  let rarezaColor = "#713bfa";

  if (cromo.rareza && typeof cromo.rareza === "object") {
    rarezaIcono = cromo.rareza.icono || "estrella";
    rarezaNombre = cromo.rareza.nombre || (en ? "Legendary" : "Legendaria");
    rarezaColor = cromo.rareza.color || "#713bfa";
  } else if (typeof cromo.rareza === "string") {
    const idRareza = cromo.rareza.toLowerCase();
    const encontrada = rarezas?.find(
      (r) =>
        r.id?.toLowerCase() === idRareza ||
        r.nombre?.toLowerCase() === idRareza,
    );
    if (encontrada) {
      rarezaIcono = encontrada.icono || "estrella";
      rarezaNombre = encontrada.nombre;
      rarezaColor = encontrada.color || "#713bfa";
    } else {
      const mapaColores = {
        legendaria: "#f59e0b",
        epica: "#8b5cf6",
        rara: "#3b82f6",
        comun: "#64748b",
      };
      rarezaIcono =
        idRareza === "legendaria"
          ? "estrella"
          : idRareza === "epica"
            ? "destello"
            : idRareza === "rara"
              ? "orbita"
              : "rayo";
      rarezaNombre =
        cromo.rareza.charAt(0).toUpperCase() + cromo.rareza.slice(1);
      rarezaColor = mapaColores[idRareza] || "#713bfa";
    }
  }

  // Resolver tipo capitalizado (héroe, aliado, villano)
  const mapaTipos = {
    heroe: en ? "Hero" : "Héroe",
    aliado: en ? "Ally" : "Aliado",
    villano: en ? "Villain" : "Villano",
  };
  const tipoRaw = cromo.tipo?.toLowerCase();
  const tipoTexto =
    mapaTipos[tipoRaw] ||
    (cromo.tipo
      ? cromo.tipo.charAt(0).toUpperCase() + cromo.tipo.slice(1)
      : en
        ? "Hero"
        : "Héroe");

  // Ilustración: CSS/SVG con colorBase y figura
  const mundoIlustracion = {
    color:
      cromo.ilustracion?.colorBase ||
      mundo?.color ||
      "#7b48ff",
    icono:
      cromo.ilustracion?.figura ||
      mundo?.icono ||
      mundo?.figura ||
      "estrella",
  };

  const nombreMundo = mundo?.nombre || "";
  const numeroFormateado = cromo.numero !== undefined && cromo.numero !== null
    ? String(cromo.numero).padStart(3, "0")
    : "000";

  return (
    <button
      type="button"
      className={`cromo cromo-${cromo.numero}`}
      style={{
        "--color-rareza": rarezaColor,
      }}
      onClick={onClick}
    >
      <span className="cromo-numero">{numeroFormateado}</span>


      <span
        className="cromo-rareza"
        style={{ borderColor: "var(--color-rareza, #191130)" }}
        aria-label={rarezaNombre}
      >
        <IconoMundo nombre={rarezaIcono} />
        <span className="rareza-texto">{rarezaNombre}</span>
      </span>

      <IlustracionCromo mundo={mundoIlustracion} />

      <b>{cromo.nombre}</b>
      <small>
        {nombreMundo ? `${nombreMundo} · ` : ""}
        {tipoTexto}
      </small>
    </button>
  );
}
