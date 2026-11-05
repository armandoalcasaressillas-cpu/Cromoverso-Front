import IconoMundo from "../IconoMundo/IconoMundo.jsx";
import AbanicoCromos from "../AbanicoCromos/AbanicoCromos.jsx";
import { useTextos } from "../../context/TextosContext.jsx";
import "./HeroCromoverso.css";

export default function HeroCromoverso({
  en,
  heroes,
  mundos,
  abrirCuenta,
  onSeleccionarCromo,
  totalAlbum = 120,
}) {
  const { textos } = useTextos();
  const tInicio = textos?.paginas?.inicio || {};

  const cantidadMundos = Array.isArray(mundos) ? mundos.length : 6;
  const totalHeroes = totalAlbum || 120;

  const tituloLinea1 = en
    ? `${cantidadMundos} worlds. ${totalHeroes} heroes.`
    : `${cantidadMundos} mundos. ${totalHeroes} héroes.`;
  const tituloLinea2 =
    tInicio.subtituloTitulo || (en ? "An album of your own." : "Un álbum tuyo.");

  const descripcion =
    tInicio.descripcion ||
    (en
      ? "Explore each world and meet its heroes. Sign up free with your email."
      : "Explora cada mundo y conoce a sus héroes. Crea tu cuenta gratis con tu correo.");

  const textoBotonPrimario =
    tInicio.botonPrimario || (en ? "Sign up free" : "Crear cuenta gratis");
  const textoBotonSecundario =
    tInicio.botonSecundario || (en ? "Explore the worlds" : "Explorar los mundos");
  const pieHero =
    tInicio.pieHero ||
    (en
      ? "Sign up with your email and start your collection."
      : "Crea tu cuenta con tu correo y empieza tu colección.");

  return (
    <section className="hero-cromoverso">
      <div className="ancho-home interior-cromoverso">
        <div className="texto-cromoverso">
          <h1>
            {tituloLinea1}
            <br />
            {tituloLinea2}
          </h1>
          <p className="descripcion-cromoverso-movil">{descripcion}</p>
          <div className="grupo-botones">
            <button
              type="button"
              className="boton-home primario"
              onClick={() => abrirCuenta("registro")}
            >
              <IconoMundo nombre="estrella" />
              {textoBotonPrimario}
            </button>
            <a href="#mundos" className="boton-home secundario">
              <IconoMundo nombre="orbita" />
              {textoBotonSecundario}
            </a>
          </div>
          <p>
            <IconoMundo nombre="destello" />
            {pieHero}
          </p>
        </div>
        <AbanicoCromos
          heroes={heroes}
          mundos={mundos}
          en={en}
          onSeleccionar={onSeleccionarCromo}
        />
      </div>
    </section>
  );
}
