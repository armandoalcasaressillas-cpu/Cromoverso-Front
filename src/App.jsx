import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import CatalogoMundo from "./pages/CatalogoMundo.jsx";
import Ingresar from "./pages/Ingresar.jsx";
import ResolverCromo from "./pages/ResolverCromo.jsx";
import { navegar, rutaCromo } from "./utils/navegacion.js";

function resolverPaginaActual() {
  const ruta = window.location.pathname;

  // Vista 4 · /ingresar
  if (/^\/ingresar\/?$/.test(ruta)) {
    return { nombre: "ingresar" };
  }

  // Vista 3 · /cromos/:id → se abre como modal encima del catálogo de su mundo
  const matchCromo = ruta.match(/^\/cromos\/([^/?#]+)/);
  if (matchCromo) {
    const cromoId = decodeURIComponent(matchCromo[1]);
    const mundoId = window.history.state?.mundoId;
    return mundoId
      ? { nombre: "mundo", id: mundoId, cromoId }
      : { nombre: "resolverCromo", cromoId };
  }

  // Vista 2 · /mundos/:id
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
    navegar(`/mundos/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function volverInicio() {
    navegar("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Abre el detalle de un cromo (desde el catálogo o desde el hero del inicio)
  function abrirCromo(cromo, mundoId) {
    navegar(rutaCromo(cromo.id), {
      estado: { mundoId: mundoId || cromo.mundo, desdeApp: true },
    });
  }

  // Anterior / siguiente: reemplaza la URL para no llenar el historial
  function cambiarCromo(cromoId) {
    navegar(rutaCromo(cromoId), {
      reemplazar: true,
      estado: { ...window.history.state },
    });
  }

  function cerrarCromo(mundoId) {
    if (window.history.state?.desdeApp) {
      // Volver a la URL desde la que se abrió (conserva los filtros)
      window.history.back();
    } else {
      // Se entró directo por el enlace: dejar el catálogo del mundo
      navegar(`/mundos/${mundoId}`, { reemplazar: true });
    }
  }

  if (pagina.nombre === "ingresar") {
    return <Ingresar />;
  }

  if (pagina.nombre === "resolverCromo") {
    return <ResolverCromo cromoId={pagina.cromoId} onVolver={volverInicio} />;
  }

  if (pagina.nombre === "mundo") {
    return (
      <CatalogoMundo
        mundoId={pagina.id}
        onVolver={volverInicio}
        onNavegarMundo={irAMundo}
        cromoId={pagina.cromoId}
        onAbrirCromo={(cromo) => abrirCromo(cromo, pagina.id)}
        onCambiarCromo={cambiarCromo}
        onCerrarCromo={() => cerrarCromo(pagina.id)}
      />
    );
  }

  return (
    <Home
      onVerMundo={irAMundo}
      onAbrirCromo={(cromo) => abrirCromo(cromo, cromo.mundo)}
    />
  );
}
