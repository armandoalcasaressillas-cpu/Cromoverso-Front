import { proyecto } from "../config/proyecto.js";

// Token de la sesión SOLO en memoria (nunca en localStorage).
// La sesión principal es la cookie httpOnly "sesion" que pone la API; el token
// en memoria es un respaldo para navegadores que bloquean cookies de terceros
// (la API está en fly.dev y el frontend en otro dominio). Se pierde al recargar.
let tokenSesion = null;

export function guardarTokenSesion(token) {
  tokenSesion = token || null;
}

/**
 * Pruebas de estados (US-CRO-S2-02): agregando a la URL de la página
 * ?simularLatencia=2000 o ?simularError=503 se envían las cabeceras
 * X-Simular-Latencia / X-Simular-Error que la API usa para simular
 * carga lenta o fallas. Sirve en local y en el despliegue de Vercel.
 */
function cabecerasDeSimulacion() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const cabeceras = {};
  const latencia = params.get("simularLatencia");
  const error = params.get("simularError");
  if (latencia && /^\d+$/.test(latencia)) cabeceras["X-Simular-Latencia"] = latencia;
  if (error && ["500", "503", "504"].includes(error)) cabeceras["X-Simular-Error"] = error;
  return cabeceras;
}

export async function consultar(
  ruta,
  { signal, method = "GET", credentials, headers, body } = {},
) {
  const tieneCuerpo = body !== undefined && body !== null;

  let respuesta;
  try {
    respuesta = await fetch(`${proyecto.api}${ruta}`, {
      method,
      signal,
      credentials,
      headers: {
        Accept: "application/json",
        ...(tieneCuerpo ? { "Content-Type": "application/json" } : {}),
        ...cabecerasDeSimulacion(),
        ...(credentials === "include" && tokenSesion
          ? { Authorization: `Bearer ${tokenSesion}` }
          : {}),
        ...headers,
      },
      ...(tieneCuerpo
        ? { body: typeof body === "string" ? body : JSON.stringify(body) }
        : {}),
    });
  } catch (errorRed) {
    if (errorRed.name === "AbortError") {
      throw errorRed;
    }
    if (errorRed instanceof TypeError) {
      const errorSinConexion = new Error("No hay conexión de red");
      errorSinConexion.codigo = "sin_conexion";
      throw errorSinConexion;
    }
    throw errorRed;
  }

  // Algunas respuestas (por ejemplo, un DELETE correcto) pueden venir sin cuerpo.
  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    const error = new Error(
      datos?.error?.mensaje || `HTTP ${respuesta.status}`,
    );
    error.codigo = datos?.error?.codigo;
    error.campos = datos?.error?.campos;
    error.status = respuesta.status;
    // 429 demasiadas_peticiones: segundos de espera de la cabecera Retry-After
    const reintentar = Number(respuesta.headers.get("Retry-After"));
    if (Number.isFinite(reintentar) && reintentar > 0) {
      error.reintentarEn = reintentar;
    }
    // US-CRO-S2-05: si una petición con sesión responde 401 no_autenticado,
    // la sesión venció. SesionContext escucha este aviso y lleva a ingresar.
    if (respuesta.status === 401 && error.codigo === "no_autenticado") {
      window.dispatchEvent(new CustomEvent("cromoverso:sesion-vencida"));
    }
    throw error;
  }

  return datos;
}
