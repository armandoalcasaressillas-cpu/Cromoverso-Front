import { useEffect, useId, useRef, useState } from "react";
import Marca from "../components/Marca/Marca.jsx";
import AbanicoCromos from "../components/AbanicoCromos/AbanicoCromos.jsx";
import GestorCookies from "../components/GestorCookies/GestorCookies.jsx";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import SaltarContenido from "../components/SaltarContenido/SaltarContenido.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useTextos } from "../context/TextosContext.jsx";
import { useSesion } from "../context/SesionContext.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { useDetalle } from "../hooks/useDetalle.js";
import { proyecto } from "../config/proyecto.js";
import { navegar, interpolar } from "../utils/navegacion.js";
import { obtenerTextoSeguro } from "../utils/textos.js";
import "./Ingresar.css";

/**
 * Vista 4 · Iniciar sesión (POST /sesion).
 * Estados: normal, contraseña visible, campos obligatorios, cargando,
 * credenciales incorrectas (mensaje genérico), validación 422 por campo,
 * demasiados intentos (429 + Retry-After) y sin conexión (Reintentar).
 */
export default function Ingresar() {
  const { idioma } = usePreferencias();
  const en = idioma === "en";
  const { textos } = useTextos();
  const { usuario, cargando: cargandoSesion, iniciarSesion } = useSesion();
  const { detalle, setDetalle, abrirCuenta } = useDetalle(idioma);

  const t = textos?.paginas?.ingresar || {};
  const tf = t.formulario || {};
  const te = t.errores || {};

  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroresCampo, setErroresCampo] = useState({});
  // alerta: { tipo: "campos" | "credenciales" | "intentos" | "conexion" | "servidor", texto? }
  const [alerta, setAlerta] = useState(() =>
    new URLSearchParams(window.location.search).get("vencida")
      ? { tipo: "vencida" }
      : null,
  );
  const [segundosEspera, setSegundosEspera] = useState(0);
  const [cookiesAbiertas, setCookiesAbiertas] = useState(false);

  const idBase = useId();
  const refAlerta = useRef(null);
  const refCorreo = useRef(null);
  const refClave = useRef(null);

  // Cromos decorativos del panel izquierdo (los mismos del hero del inicio)
  const { datos: resMundos } = useRecurso("/mundos");
  const primerMundo = resMundos?.datos?.[0]?.id;
  const { datos: resMundo } = useRecurso(primerMundo ? `/mundos/${primerMundo}` : null);
  const cromosPanel = (resMundo?.cromos || []).slice(0, 3);

  // Si ya hay sesión, esta vista no tiene sentido: volver al destino
  useEffect(() => {
    if (!cargandoSesion && usuario && !enviando) {
      navegar("/", { reemplazar: true });
    }
  }, [usuario, cargandoSesion, enviando]);

  // Título de la pestaña
  useEffect(() => {
    const anterior = document.title;
    document.title = obtenerTextoSeguro(
      t.seo?.titulo,
      en ? "Log in · Cromoverso" : "Ingresar · Cromoverso",
    );
    return () => {
      document.title = anterior;
    };
  }, [t.seo?.titulo, en]);

  // Cuenta regresiva del 429 (Retry-After)
  useEffect(() => {
    if (segundosEspera <= 0) {
      setAlerta((a) => (a?.tipo === "intentos" ? null : a));
      return;
    }
    const temporizador = setTimeout(() => setSegundosEspera((s) => s - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [segundosEspera]);

  // Foco tras cada envío fallido: con errores de campo va al primer campo con
  // error (US-CRO-S2-03); con los demás errores va a la alerta.
  const [envioFallido, setEnvioFallido] = useState(0);
  const erroresRef = useRef(erroresCampo);
  erroresRef.current = erroresCampo;
  useEffect(() => {
    if (!envioFallido) return;
    const errores = erroresRef.current;
    if (errores.correo) refCorreo.current?.focus();
    else if (errores.clave) refClave.current?.focus();
    else refAlerta.current?.focus();
  }, [envioFallido]);

  function validarEnFrontend() {
    const errores = {};
    if (!correo.trim()) {
      errores.correo = obtenerTextoSeguro(
        te.correoObligatorio,
        en ? "Enter your email." : "Escribe tu correo electrónico.",
      );
    }
    if (!clave) {
      errores.clave = obtenerTextoSeguro(
        te.claveObligatoria,
        en ? "Enter your password." : "Escribe tu contraseña.",
      );
    }
    return errores;
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando || segundosEspera > 0) return;

    const errores = validarEnFrontend();
    if (Object.keys(errores).length > 0) {
      setErroresCampo(errores);
      setAlerta({ tipo: "campos" });
      setEnvioFallido((n) => n + 1);
      return;
    }

    setEnviando(true);
    setErroresCampo({});
    setAlerta(null);
    try {
      await iniciarSesion({ correo: correo.trim(), clave });
      // US-CRO-S2-03: con datos correctos vuelve al inicio con la sesión iniciada
      navegar("/", { reemplazar: true });
      window.scrollTo({ top: 0 });
    } catch (error) {
      setEnviando(false);
      manejarError(error);
      setEnvioFallido((n) => n + 1);
    }
  }

  function manejarError(error) {
    switch (error?.codigo) {
      case "credenciales_invalidas":
        // Un solo mensaje genérico: no se dice cuál campo está mal
        setAlerta({ tipo: "credenciales" });
        setClave("");
        break;
      case "validacion": {
        // 422: mensaje de cada campo junto a su campo
        const campos = error.campos || {};
        setErroresCampo({ correo: campos.correo, clave: campos.clave });
        setAlerta({ tipo: "campos", texto: textos?.errores?.validacion });
        break;
      }
      case "demasiadas_peticiones":
        setSegundosEspera(error.reintentarEn || 60);
        setAlerta({ tipo: "intentos" });
        break;
      case "sin_conexion":
        // Lo que escribió la persona se conserva
        setAlerta({ tipo: "conexion" });
        break;
      default:
        setAlerta({
          tipo: "servidor",
          texto:
            textos?.errores?.[error?.codigo] ||
            textos?.errores?.generico ||
            (en ? "Something went wrong. Please try again." : "Algo salió mal. Vuelve a intentarlo."),
        });
    }
  }

  // ----- Textos de la alerta -----
  function contenidoAlerta() {
    if (!alerta) return null;
    if (alerta.tipo === "campos") {
      return {
        titulo: obtenerTextoSeguro(
          te.camposObligatorios?.titulo,
          en ? "Check the highlighted fields" : "Revisa los campos marcados",
        ),
        texto: obtenerTextoSeguro(
          alerta.texto || te.camposObligatorios?.texto,
          en ? "To log in, enter your email and password." : "Para ingresar escribe tu correo y tu contraseña.",
        ),
      };
    }
    if (alerta.tipo === "credenciales") {
      return {
        titulo: obtenerTextoSeguro(
          te.credenciales?.titulo,
          en ? "Incorrect email or password" : "Correo o contraseña incorrectos",
        ),
        texto: obtenerTextoSeguro(
          te.credenciales?.texto,
          en
            ? "Check your details and try again. If you don't remember your password, you can reset it."
            : "Revisa los datos e inténtalo de nuevo. Si no recuerdas tu contraseña, puedes restablecerla.",
        ),
      };
    }
    if (alerta.tipo === "vencida") {
      return {
        titulo: obtenerTextoSeguro(
          textos?.errores?.no_autenticado,
          en ? "Log in to continue." : "Inicia sesión para continuar.",
        ),
        texto: "",
      };
    }
    if (alerta.tipo === "intentos") {
      return {
        titulo: obtenerTextoSeguro(
          te.demasiadosIntentos?.titulo,
          en ? "Too many attempts" : "Demasiados intentos",
        ),
        texto: interpolar(
          te.demasiadosIntentos?.texto ||
            (en
              ? "Wait {segundos} seconds before trying again."
              : "Espera {segundos} segundos antes de volver a intentarlo."),
          { segundos: segundosEspera },
        ),
      };
    }
    if (alerta.tipo === "conexion") {
      return {
        titulo: obtenerTextoSeguro(
          te.conexion?.titulo,
          en ? "We couldn't connect" : "No pudimos conectarnos",
        ),
        texto: obtenerTextoSeguro(
          te.conexion?.texto,
          en
            ? "Check your internet connection and try again. What you typed is kept."
            : "Revisa tu conexión a internet e inténtalo de nuevo. Lo que escribiste se conserva.",
        ),
      };
    }
    return {
      titulo: obtenerTextoSeguro(alerta.texto, en ? "Something went wrong" : "Algo salió mal"),
      texto: "",
    };
  }

  const datosAlerta = contenidoAlerta();
  // 429: el formulario queda bloqueado durante los segundos de Retry-After
  const bloqueado = enviando || segundosEspera > 0;
  const esReintento = alerta?.tipo === "conexion" || alerta?.tipo === "servidor";

  const textoBoton = enviando
    ? obtenerTextoSeguro(tf.mensajes?.ingresando, en ? "Logging in…" : "Ingresando…")
    : esReintento
      ? obtenerTextoSeguro(te.conexion?.botones?.reintentar, en ? "Try again" : "Reintentar")
      : obtenerTextoSeguro(tf.botones?.ingresar, en ? "Log in" : "Ingresar");

  const tituloPresentacion = obtenerTextoSeguro(
    t.presentacion?.titulo,
    en ? "Six worlds. 120 heroes. One album of your own." : "Seis mundos. 120 héroes. Un álbum tuyo.",
  );
  // "Seis mundos. 120 héroes. Un álbum tuyo." → una línea por frase
  const lineasPresentacion = tituloPresentacion.split(/(?<=\.)\s+/);

  function abrirProximamente(titulo) {
    setDetalle({
      titulo,
      descripcion: en
        ? "This option will be available soon."
        : "Esta opción estará disponible muy pronto.",
      cerrar: en ? "Close" : "Cerrar",
    });
  }

  const idCorreo = `${idBase}-correo`;
  const idClave = `${idBase}-clave`;
  const idErrorCorreo = `${idBase}-error-correo`;
  const idErrorClave = `${idBase}-error-clave`;

  return (
    <div className={`pagina-ingresar ${proyecto.id}`}>
      <SaltarContenido
        texto={en ? "Skip to the form" : "Saltar al formulario"}
        destino="formulario-ingresar"
      />

      <aside className="ingresar-presentacion">
        <Marca nombre={proyecto.nombre} tipo={proyecto.id} />
        <div className="ingresar-abanico" inert aria-hidden="true">
          <AbanicoCromos
            heroes={cromosPanel}
            mundos={resMundos?.datos || []}
            en={en}
            onSeleccionar={() => {}}
          />
        </div>
        <div className="ingresar-presentacion-texto">
          <span className="ingresar-etiqueta">
            {obtenerTextoSeguro(
              t.presentacion?.etiquetas?.temporada,
              en ? "Season 1 · Six worlds" : "Temporada 1 · Seis mundos",
            )}
          </span>
          <p className="ingresar-presentacion-titulo">
            {lineasPresentacion.map((linea) => (
              <span key={linea}>{linea}</span>
            ))}
          </p>
          <p>
            {obtenerTextoSeguro(
              t.presentacion?.texto,
              en
                ? "Explore six worlds and meet their 120 original heroes."
                : "Explora seis mundos y conoce a sus 120 héroes originales.",
            )}
          </p>
        </div>
      </aside>

      <main className="ingresar-zona" id="formulario-ingresar" tabIndex={-1}>
        <div className="ingresar-caja">
          <div className="ingresar-marca-pequena">
            <Marca nombre={proyecto.nombre} tipo={proyecto.id} />
          </div>
          <h1>{obtenerTextoSeguro(tf.titulo, en ? "Log in to your account" : "Ingresa a tu cuenta")}</h1>
          <p className="ingresar-subtitulo">
            {obtenerTextoSeguro(
              tf.subtitulo,
              en
                ? "Log in with the email and password of your account."
                : "Ingresa con el correo y la contraseña de tu cuenta.",
            )}
          </p>

          {datosAlerta && (
            <div className="ingresar-alerta" role="alert" tabIndex={-1} ref={refAlerta}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v6m0 3.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <b>{datosAlerta.titulo}</b>
                {datosAlerta.texto && <p>{datosAlerta.texto}</p>}
              </div>
            </div>
          )}

          <form className="ingresar-formulario" onSubmit={enviar} noValidate aria-busy={enviando}>
            <div className="ingresar-campo">
              <label htmlFor={idCorreo}>
                {obtenerTextoSeguro(tf.etiquetas?.correo, en ? "Email" : "Correo electrónico")}
              </label>
              <input
                ref={refCorreo}
                id={idCorreo}
                type="email"
                name="correo"
                autoComplete="email"
                inputMode="email"
                placeholder={obtenerTextoSeguro(
                  tf.placeholders?.correo,
                  en ? "name@email.com" : "nombre@correo.com",
                )}
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (erroresCampo.correo) setErroresCampo((p) => ({ ...p, correo: undefined }));
                }}
                aria-invalid={Boolean(erroresCampo.correo)}
                aria-describedby={erroresCampo.correo ? idErrorCorreo : undefined}
                disabled={bloqueado}
              />
              {erroresCampo.correo && (
                <p className="ingresar-error-campo" id={idErrorCorreo}>
                  <span aria-hidden="true">⚠</span> {erroresCampo.correo}
                </p>
              )}
            </div>

            <div className="ingresar-campo">
              <label htmlFor={idClave}>
                {obtenerTextoSeguro(tf.etiquetas?.clave, en ? "Password" : "Contraseña")}
              </label>
              <div className="ingresar-clave">
                <input
                  ref={refClave}
                  id={idClave}
                  type={verClave ? "text" : "password"}
                  name="clave"
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => {
                    setClave(e.target.value);
                    if (erroresCampo.clave) setErroresCampo((p) => ({ ...p, clave: undefined }));
                  }}
                  aria-invalid={Boolean(erroresCampo.clave)}
                  aria-describedby={erroresCampo.clave ? idErrorClave : undefined}
                  disabled={bloqueado}
                />
                <button
                  type="button"
                  className="ingresar-ver-clave"
                  aria-pressed={verClave}
                  aria-controls={idClave}
                  aria-label={
                    verClave
                      ? obtenerTextoSeguro(tf.botones?.ocultarClave, en ? "Hide password" : "Ocultar contraseña")
                      : obtenerTextoSeguro(tf.botones?.mostrarClave, en ? "Show password" : "Mostrar contraseña")
                  }
                  onClick={() => setVerClave((v) => !v)}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {verClave && <path d="M4 4l16 16" />}
                  </svg>
                </button>
              </div>
              {erroresCampo.clave && (
                <p className="ingresar-error-campo" id={idErrorClave}>
                  <span aria-hidden="true">⚠</span> {erroresCampo.clave}
                </p>
              )}
            </div>

            <div className="ingresar-opciones">
              <label className="ingresar-recordar">
                <input
                  type="checkbox"
                  checked={mantenerSesion}
                  onChange={(e) => setMantenerSesion(e.target.checked)}
                />
                {obtenerTextoSeguro(
                  tf.etiquetas?.mantenerSesion,
                  en ? "Keep me logged in" : "Mantener la sesión iniciada",
                )}
              </label>
              <button
                type="button"
                className="ingresar-enlace"
                onClick={() =>
                  abrirProximamente(
                    obtenerTextoSeguro(
                      tf.enlaces?.olvidasteClave,
                      en ? "Forgot your password?" : "¿Olvidaste tu contraseña?",
                    ),
                  )
                }
              >
                {obtenerTextoSeguro(
                  tf.enlaces?.olvidasteClave,
                  en ? "Forgot your password?" : "¿Olvidaste tu contraseña?",
                )}
              </button>
            </div>

            <button
              type="submit"
              className={`boton-home primario ingresar-enviar${enviando ? " cargando" : ""}`}
              disabled={bloqueado}
            >
              {enviando && <span className="ingresar-spinner" aria-hidden="true" />}
              {segundosEspera > 0 ? `${textoBoton} (${segundosEspera})` : textoBoton}
            </button>
          </form>

          <p className="ingresar-sin-cuenta">
            {obtenerTextoSeguro(tf.mensajes?.sinCuenta, en ? "Don't have an account?" : "¿No tienes cuenta?")}{" "}
            <button type="button" className="ingresar-enlace" onClick={() => abrirCuenta("registro")}>
              {obtenerTextoSeguro(tf.enlaces?.crearCuenta, en ? "Create an account" : "Crea una cuenta")}
            </button>
          </p>
        </div>
      </main>

      <GestorCookies
        abierto={cookiesAbiertas}
        onAbrir={() => setCookiesAbiertas(true)}
        onCerrar={() => setCookiesAbiertas(false)}
      />
      <DialogoDetalle detalle={detalle} onCerrar={() => setDetalle(null)} />
    </div>
  );
}
