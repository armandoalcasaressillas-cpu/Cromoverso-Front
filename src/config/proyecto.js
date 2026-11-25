const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  console.error("Error: La variable de entorno VITE_API_URL no está definida.");
}

export const proyecto = {
  id: "cromoverso",
  nombre: "cromoverso",
  api: apiUrl || "",
};
