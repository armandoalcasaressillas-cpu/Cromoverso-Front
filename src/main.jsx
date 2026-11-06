import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/accesibilidad.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { PreferenciasProvider } from "./context/PreferenciasContext.jsx";
import { TextosProvider } from "./context/TextosContext.jsx";
import { SesionProvider } from "./context/SesionContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PreferenciasProvider>
      <TextosProvider>
        <SesionProvider>
          <App />
        </SesionProvider>
      </TextosProvider>
    </PreferenciasProvider>
  </StrictMode>,
);
