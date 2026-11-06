import TarjetaCromo from "../TarjetaCromo/TarjetaCromo.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import "./AbanicoCromos.css";

export default function AbanicoCromos({ heroes, mundos, en, onSeleccionar }) {
  const { textos } = useTextos();
  const etiqueta =
    textos?.paginas?.inicio?.etiquetaGuardiana ||
    (en ? "Holographic guardian" : "Guardiana holográfica");

  const listaHeroes = Array.isArray(heroes) ? heroes : [];

  return (
    <div className="abanico-cromos">
      <span className="etiqueta-cromos">{etiqueta}</span>
      {listaHeroes.map((heroe, idx) => {
        let mundoDelHeroe = null;
        if (typeof heroe.mundo === "object" && heroe.mundo !== null) {
          mundoDelHeroe = heroe.mundo;
        } else if (Array.isArray(mundos)) {
          mundoDelHeroe =
            mundos.find((m) => m.id === heroe.mundo) ||
            mundos[heroe.mundo] ||
            mundos[0];
        } else if (mundos && typeof mundos === "object") {
          mundoDelHeroe = mundos[heroe.mundo] || Object.values(mundos)[0];
        }

        const mundoAdaptado = {
          nombre: mundoDelHeroe?.nombre || "",
          color:
            heroe.ilustracion?.colorBase ||
            mundoDelHeroe?.color ||
            "#7b48ff",
          icono:
            heroe.ilustracion?.figura ||
            mundoDelHeroe?.figura ||
            mundoDelHeroe?.icono ||
            "estrella",
        };

        return (
          <TarjetaCromo
            key={heroe.numero || heroe.id || idx}
            heroe={heroe}
            mundo={mundoAdaptado}
            en={en}
            onClick={() => onSeleccionar(heroe)}
          />
        );
      })}
    </div>
  );
}
