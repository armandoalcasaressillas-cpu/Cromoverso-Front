import "./IconoMundo.css";
export default function IconoMundo({ nombre }) {
  const trazos = {
    rayo: "m14 2-9 12h6l-1 8 9-13h-6z",
    orbita:
      "M4 15c3-8 11-8 16-8M8 9c-6 5-3 10 4 8s11-9 6-10M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    destello: "m9 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 14v8m-4-4h8",
    llama:
      "M13 2c2 5-4 6-2 11 3-1 4-4 4-6 7 7 6 15-3 15S2 14 7 8c0 5 2 5 2 5-2-5 4-7 4-11Z",
    estrella: "m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1z",
    circulo: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16",
    rombo: "m12 2 9 10-9 10-9-10z",
    corona: "m3 7 4 5 5-7 5 7 4-5-2 12H5zM5 21h14",
    ojo: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={trazos[nombre] || trazos.estrella} />
    </svg>
  );
}
