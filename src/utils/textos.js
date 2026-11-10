/**
 * Devuelve un texto seguro para renderizar en React.
 * La API puede devolver un string o un objeto con título/texto, así que
 * nunca exponemos el objeto directamente como hijo de un componente.
 */
export function obtenerTextoSeguro(valor, respaldo = "") {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number") return String(valor);
  if (valor && typeof valor === "object") {
    if (typeof valor.titulo === "string") return valor.titulo;
    if (typeof valor.texto === "string") return valor.texto;
    if (typeof valor.nombre === "string") return valor.nombre;
    if (typeof valor.descripcion === "string") return valor.descripcion;
  }
  return respaldo;
}
