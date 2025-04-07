import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext"; // Импортируем AuthProvider

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider> {/* Оборачиваем App в контекст авторизации */}
            <App />
        </AuthProvider>
    </StrictMode>
);