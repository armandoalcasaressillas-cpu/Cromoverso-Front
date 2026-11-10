import { proyecto } from "../config/proyecto.js";

export async function consultar(
  ruta,
  { signal, method = "GET", credentials, headers, body } = {},
) {
  const tieneCuerpo = body !== undefined && body !== null;

  const respuesta = await fetch(`${proyecto.api}${ruta}`, {
    method,
    signal,
    credentials,
    headers: {
      Accept: "application/json",
      ...(tieneCuerpo ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(tieneCuerpo
      ? { body: typeof body === "string" ? body : JSON.stringify(body) }
      : {}),
  });

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
    throw error;
  }

  return datos;
}
