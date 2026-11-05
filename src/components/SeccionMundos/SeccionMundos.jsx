import Flecha from "../Flecha/Flecha.jsx";
import TarjetaMundo from "../TarjetaMundo/TarjetaMundo.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import "./SeccionMundos.css";

export default function SeccionMundos({ mundos = [], en, abrirMundo }) {
  const { textos } = useTextos();
  const tInicio = textos?.paginas?.inicio || {};

  const titulo =
    tInicio.seccionMundosTitulo ||
    (en ? "The six worlds" : "Los seis mundos");
  const descripcion =
    tInicio.seccionMundosDescripcion ||
    (en
      ? "Each world has 20 cards featuring heroes, villains and allies."
      : "Cada mundo tiene 20 cromos de héroes, villanos y aliados.");

  const primerMundo = mundos[0];
  const textoVerPrimero = primerMundo
    ? `${en ? "View" : "Ver"} ${primerMundo.nombre}`
    : tInicio.verMundo1 || (en ? "View Ciudad Neón" : "Ver Ciudad Neón");

  return (
    <section className="seccion-mundos" id="mundos">
      <div className="ancho-home">
        <div className="titulo-seccion">
          <div>
            <h2>{titulo}</h2>
            <p>{descripcion}</p>
          </div>
          {primerMundo && (
            <button
              type="button"
              className="enlace-home"
              onClick={() => abrirMundo(primerMundo)}
            >
              <Flecha />
              {textoVerPrimero}
            </button>
          )}
        </div>
        <div className="mundos-grid">
          {mundos.map((mundo, i) => {
            const mundoMapeado = {
              ...mundo,
              icono: mundo.figura || mundo.icono,
            };
            return (
              <TarjetaMundo
                key={mundo.id || mundo.nombre || i}
                mundo={mundoMapeado}
                i={i}
                en={en}
                onSeleccionar={abrirMundo}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
