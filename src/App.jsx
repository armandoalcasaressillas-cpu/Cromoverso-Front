import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import CatalogoMundo from "./pages/CatalogoMundo.jsx";

function resolverPaginaActual() {
  const ruta = window.location.pathname;
  const match = ruta.match(/^\/mundos\/([^/?#]+)/);
  if (match) {
    return { nombre: "mundo", id: match[1] };
  }
  const params = new URLSearchParams(window.location.search);
  const mundoQuery = params.get("mundo");
  if (mundoQuery) {
    return { nombre: "mundo", id: mundoQuery };
  }
  return { nombre: "inicio" };
}

export default function App() {
  const [pagina, setPagina] = useState(resolverPaginaActual);

  useEffect(() => {
    function alCambiarHistorial() {
      setPagina(resolverPaginaActual());
    }
    window.addEventListener("popstate", alCambiarHistorial);
    return () => window.removeEventListener("popstate", alCambiarHistorial);
  }, []);

  function irAMundo(mundoOId) {
    const id = typeof mundoOId === "object" ? mundoOId.id : mundoOId;
    window.history.pushState(null, "", `/mundos/${id}`);
    setPagina({ nombre: "mundo", id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function volverInicio() {
    window.history.pushState(null, "", "/");
    setPagina({ nombre: "inicio" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (pagina.nombre === "mundo") {
    return (
      <CatalogoMundo
        mundoId={pagina.id}
        onVolver={volverInicio}
        onNavegarMundo={irAMundo}
      />
    );
  }

  return <Home onVerMundo={irAMundo} />;
}

