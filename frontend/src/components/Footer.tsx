import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import whatsappIcon from "../assets/WhatsApp.png";
import instagramIcon from "../assets/Instagram.png";
import telegramIcon from "../assets/Telegram.png";
import "../styles/Footer.css"; // Подключаем стили

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Левая часть: Иконки соцсетей */}
                <div className="footer-icons">
                    <a href="https://www.whatsapp.com/?lang=ru_RU" target="_blank" rel="noopener noreferrer">
                        <img src={whatsappIcon} alt="WhatsApp" />
                    </a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                        <img src={instagramIcon} alt="Instagram" />
                    </a>
                    <a href="https://desktop.telegram.org/" target="_blank" rel="noopener noreferrer">
                        <img src={telegramIcon} alt="Telegram" />
                    </a>
                </div>

                {/* Центр: Логотип */}
                <div className="footer-logo">
                    <Link to="/">
                        <img src={logo} alt="FixMyCar Logo" />
                    </Link>
                </div>

                {/* Правая часть: Авторские права */}
                <div className="footer-text">
                    © 2025 FixMyCar. Все права защищены.
                </div>
            </div>
        </footer>
    );
};

export default Footer;