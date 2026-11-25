/**
 * Navegación sin librerías de routing.
 * Cambia la URL con pushState/replaceState y avisa a App disparando un
 * evento "popstate", que es el mismo que escucha para los botones
 * atrás/adelante del navegador.
 */
export function navegar(ruta, { reemplazar = false, estado = null } = {}) {
  if (reemplazar) {
    window.history.replaceState(estado, "", ruta);
  } else {
    window.history.pushState(estado, "", ruta);
  }
  window.dispatchEvent(new PopStateEvent("popstate", { state: estado }));
}

/** Devuelve la ruta actual (pathname + query) para volver a ella después. */
export function rutaActual() {
  return `${window.location.pathname}${window.location.search}`;
}

/** Normaliza el id de un cromo para la URL: "CV-008" → "cv-008". */
export function rutaCromo(id) {
  return `/cromos/${String(id).toLowerCase()}`;
}

/** Reemplaza {variables} en los textos de la API: "Total {total}". */
export function interpolar(plantilla, valores = {}) {
  if (typeof plantilla !== "string") return "";
  return plantilla.replace(/\{(\w+)\}/g, (_, clave) =>
    valores[clave] !== undefined && valores[clave] !== null
      ? String(valores[clave])
      : "",
  );
}
