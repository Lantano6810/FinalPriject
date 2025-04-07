import { createContext, useState, useEffect, ReactNode } from "react";

// Тип данных для контекста
interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

// Создаём контекст
export const AuthContext = createContext<AuthContextType | null>(null);

// Провайдер контекста
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Проверяем наличие токена при загрузке страницы
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Функция для входа (сохраняем токен и обновляем состояние)
    const login = (token: string) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
    };

    // Функция для выхода (удаляем токен и обновляем состояние)
    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};