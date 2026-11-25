import { createContext, useContext, useEffect, useRef, useState } from "react";
import { consultar, guardarTokenSesion } from "../services/api.js";
import { navegar } from "../utils/navegacion.js";

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const consultandoRef = useRef(false);
  const usuarioRef = useRef(null);
  usuarioRef.current = usuario;

  async function obtenerSesion() {
    if (consultandoRef.current) return;
    consultandoRef.current = true;
    try {
      // GET /sesion → { usuario }. Sin sesión responde 401 no_autenticado.
      const res = await consultar("/sesion", { credentials: "include" });
      setUsuario(res?.usuario || null);
    } catch {
      // 401 no_autenticado o ausencia de sesión: estado normal de visitante.
      // (El navegador igual muestra el 401 en la consola: es esperado.)
      setUsuario(null);
    } finally {
      setCargando(false);
      consultandoRef.current = false;
    }
  }

  useEffect(() => {
    obtenerSesion();
  }, []);

  // Sesión vencida: si había usuario y la API responde 401 no_autenticado,
  // se limpia la sesión y se lleva a la persona a ingresar.
  useEffect(() => {
    function alVencer() {
      if (!usuarioRef.current) return; // visitante: el 401 es normal
      guardarTokenSesion(null);
      setUsuario(null);
      navegar("/ingresar?vencida=1");
    }
    // Al volver a la pestaña se revisa si la sesión sigue activa
    function alVolverALaPestana() {
      if (document.visibilityState === "visible" && usuarioRef.current) {
        obtenerSesion();
      }
    }
    window.addEventListener("cromoverso:sesion-vencida", alVencer);
    document.addEventListener("visibilitychange", alVolverALaPestana);
    return () => {
      window.removeEventListener("cromoverso:sesion-vencida", alVencer);
      document.removeEventListener("visibilitychange", alVolverALaPestana);
    };
  }, []);

  /**
   * POST /sesion { correo, clave } → 201 { usuario, token }.
   * La API pone la cookie httpOnly "sesion"; el token solo queda en memoria.
   * Los errores (401, 422, 429, sin_conexion) se lanzan para que el
   * formulario los muestre.
   */
  async function iniciarSesion({ correo, clave }) {
    const res = await consultar("/sesion", {
      method: "POST",
      credentials: "include",
      body: { correo, clave },
    });
    guardarTokenSesion(res?.token);
    setUsuario(res?.usuario || null);
    setCargando(false);
    return res?.usuario || null;
  }

  async function cerrarSesion() {
    try {
      // DELETE /sesion → 204 sin cuerpo
      await consultar("/sesion", { method: "DELETE", credentials: "include" });
    } catch {
      // Si falla la red, igualmente se limpia el estado local
    }
    guardarTokenSesion(null);
    setUsuario(null);
    // Vuelve al inicio como visitante
    navegar("/");
    window.scrollTo({ top: 0 });
  }

  return (
    <SesionContext.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
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
      iniciarSesion: async () => null,
      cerrarSesion: async () => {},
      recargarSesion: async () => {},
    };
  }
  return valor;
}
