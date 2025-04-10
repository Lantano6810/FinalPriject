import { useEffect, useState } from "react";
import MyServiceApplications from "../components/MyServiceApplications"; // Новый компонент
import MyServiceData from "../components/MyServiceData";
import UploadPhotos from "../components/UploadPhotos";
import "../styles/ServicePage.css";
import "../styles/uploadPhotos.css";

const ServicePage = () => {
    const [activeTab, setActiveTab] = useState("applications");

    useEffect(() => {
        document.body.classList.add("service-page");
        return () => document.body.classList.remove("service-page");
    }, []);

    return (
        <div className="service-container">
            <div className="tabs">
                <button
                    className={activeTab === "applications" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("applications")}
                >
                    Заявки
                </button>
                <button
                    className={activeTab === "info" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("info")}
                >
                    Информация о сервисе
                </button>
                <button
                    className={activeTab === "photos" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("photos")}
                >
                    Фотографии
                </button>
            </div>

            {/* Содержимое вкладок */}
            <div className="tab-content">
                {activeTab === "applications" && <MyServiceApplications />}
                {activeTab === "info" && <MyServiceData />}
                {activeTab === "photos" && <UploadPhotos />}
            </div>
        </div>
    );
};

export default ServicePage;