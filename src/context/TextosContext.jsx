import { createContext, useContext, useEffect, useState } from "react";
import { usePreferencias } from "./PreferenciasContext.jsx";
import { consultar } from "../services/api.js";
import { interfaz } from "../data/interfaz.js";

const TextosContext = createContext(null);

function esObjetoPlano(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function fusionarProfundo(base, sobreescritura) {
  if (!sobreescritura) return base;
  if (!esObjetoPlano(sobreescritura)) return sobreescritura;

  const resultado = esObjetoPlano(base) ? { ...base } : {};

  for (const clave of Object.keys(sobreescritura)) {
    const valorSobre = sobreescritura[clave];
    const valorBase = esObjetoPlano(base) ? base[clave] : undefined;

    if (esObjetoPlano(valorSobre)) {
      resultado[clave] = fusionarProfundo(valorBase, valorSobre);
    } else if (valorSobre !== undefined) {
      resultado[clave] = valorSobre;
    }
  }
  return resultado;
}

export function TextosProvider({ children }) {
  const { idioma } = usePreferencias();
  const fallback = interfaz[idioma] || interfaz.es;
  const [textos, setTextos] = useState(fallback);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    const baseLocal = interfaz[idioma] || interfaz.es;
    setTextos(baseLocal);

    consultar(`/textos?idioma=${idioma}`)
      .then((datos) => {
        if (!activo) return;
        if (datos?.textos) {
          const fusionado = fusionarProfundo(baseLocal, datos.textos);
          setTextos(fusionado);
        }
        setCargando(false);
      })
      .catch((err) => {
        if (!activo) return;
        if (
          err?.codigo === "idioma_no_soportado" ||
          err?.status === 400
        ) {
          consultar("/textos?idioma=es")
            .then((datosEs) => {
              if (!activo) return;
              if (datosEs?.textos) {
                setTextos(fusionarProfundo(interfaz.es, datosEs.textos));
              }
              setCargando(false);
            })
            .catch(() => {
              if (activo) {
                setTextos(interfaz.es);
                setCargando(false);
              }
            });
        } else {
          setError(err);
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [idioma]);

  return (
    <TextosContext.Provider value={{ textos, idioma, cargando, error }}>
      {children}
    </TextosContext.Provider>
  );
}

export function useTextos() {
  const valor = useContext(TextosContext);
  if (!valor) {
    return {
      textos: interfaz.es,
      idioma: "es",
      cargando: false,
      error: null,
    };
  }
  return valor;
}
