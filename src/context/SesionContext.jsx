import { createContext, useContext, useEffect, useRef, useState } from "react";
import { consultar } from "../services/api.js";

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const consultandoRef = useRef(false);

  async function obtenerSesion() {
    if (consultandoRef.current) return;
    consultandoRef.current = true;
    try {
      const res = await consultar("/sesion", { credentials: "include" });
      if (res?.usuario) {
        setUsuario(res.usuario);
      } else {
        setUsuario(null);
      }
    } catch {
      // 401 no_autenticado o ausencia de sesión: estado normal sin sesión activa
      setUsuario(null);
    } finally {
      setCargando(false);
      consultandoRef.current = false;
    }
  }

  useEffect(() => {
    obtenerSesion();
  }, []);

  async function cerrarSesion() {
    try {
      await consultar("/sesion", { method: "DELETE", credentials: "include" });
    } catch {
      // En caso de fallo de red en DELETE, igualmente se limpia el estado local
    }
    setUsuario(null);
  }

  return (
    <SesionContext.Provider
      value={{
        usuario,
        cargando,
        cerrarSesion,
        recargarSesion: obtenerSesion,
      }}
    >
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const valor = useContext(SesionContext);
  if (!valor) {
    return {
      usuario: null,
      cargando: false,
      cerrarSesion: async () => {},
      recargarSesion: async () => {},
    };
  }
  return valor;
}
