import { useState } from "react";
import { navegar } from "../utils/navegacion.js";
export function useDetalle(idioma = "es") {
  const [detalle, setDetalle] = useState(null);
  function abrirCuenta(tipo) {
    // Sprint 2: "Ingresar" lleva a la vista real de inicio de sesión.
    if (tipo === "ingresar") {
      navegar("/ingresar");
      window.scrollTo({ top: 0 });
      return;
    }
    // El registro llega en el Sprint 3: por ahora se mantiene el aviso.
    const en = idioma === "en";
    setDetalle({
      titulo:
        tipo === "registro"
          ? en
            ? "Create an account"
            : "Crear cuenta"
          : en
            ? "Log in"
            : "Iniciar sesión",
      descripcion: en
        ? "Account access is not available yet. You can explore the public catalogue without signing in."
        : "El acceso a cuentas aún no está disponible. Puedes explorar el catálogo público sin iniciar sesión.",
      cerrar: en ? "Continue exploring" : "Seguir explorando",
    });
  }
  return { detalle, setDetalle, abrirCuenta };
}
