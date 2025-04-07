import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

interface HeaderProps {
    className?: string;
}

const Header = ({ className = "" }: HeaderProps) => {
    const auth = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<string | null>(null);

    if (!auth) return null;

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (storedRole) setUserRole(storedRole);
    }, [auth.isAuthenticated]);

    // ✅ Обработчик выхода (очищает все данные в localStorage)
    const handleLogout = () => {
        auth.logout();
        localStorage.clear(); // ✅ Очищаем всё из localStorage
        navigate("/login");
    };

    return (
        <nav
            className={`navbar navbar-expand-lg w-100 py-3 ${className}`}
            style={{
                backgroundColor: "#132043",
                boxShadow: "0px 7px 10px rgba(0, 0, 0, 0.3)",
            }}
        >
            <div className="container d-flex align-items-center">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src={logo} alt="Лого СТО" width="170" height="40" className="me-2" />
                </Link>

                <div className="d-flex ms-auto">
                    {auth.isAuthenticated ? (
                        <>
                            {userRole === "service" && (
                                <Link className="btn custom-btn me-2" to="/service">
                                    Мой сервис
                                </Link>
                            )}
                            {userRole === "car_owner" && (
                                <Link className="btn custom-btn me-2" to="/cabinet">
                                    Моя сервисная книжка
                                </Link>
                            )}
                            <button className="btn custom-btn me-2" onClick={handleLogout}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            {!location.pathname.includes("/login") && (
                                <Link className="btn custom-btn me-2" to="/login">
                                    Войти
                                </Link>
                            )}
                            {!location.pathname.includes("/register") && (
                                <Link className="btn custom-btn" to="/register">
                                    Регистрация
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;