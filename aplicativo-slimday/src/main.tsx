import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("SlimDay App: Iniciando montagem do React...");
createRoot(document.getElementById("root")!).render(<App />);
