import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SeeServicePhoto from "../components/SeeServicePhoto";
import ServiceApplications from "../components/ServiceApplications";
import "../styles/OrderServiceData.css";

const OrderServiceData = () => {
    const { id } = useParams();
    const serviceServiceId = id ? Number(id) : null;

    const [serviceData, setServiceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!serviceServiceId) {
            setError("Ошибка: ID сервиса отсутствует.");
            setLoading(false);
            return;
        }

        const fetchServiceData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/services/${serviceServiceId}`);
                if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
                const data = await response.json();
                setServiceData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [serviceServiceId]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="order-container">
            <div className="service-info-box">
                <h3>{serviceData?.service_name}</h3>

                <div className="service-info-item">
                    <strong>Город:</strong>
                    <span>{serviceData?.city}</span>
                </div>

                <div className="service-info-item">
                    <strong>Адрес:</strong>
                    <span>{serviceData?.address || "Не указан"}</span>
                </div>

                <div className="service-info-item">
                    <strong>Часы работы:</strong>
                    <span>{serviceData?.time_start} - {serviceData?.time_end}</span>
                </div>

                <div className="service-info-item">
                    <strong>Лимит записей в день:</strong>
                    <span>{serviceData?.daily_limit}</span>
                </div>

                <div className="service-info-item full-width">
                    <strong>Услуги:</strong>
                    <span>{serviceData?.works?.join(", ") || "Не указаны"}</span>
                </div>
            </div>

            {/* Компонент с фото */}
            <SeeServicePhoto />

            {/* Компонент с заявками */}
            <ServiceApplications />
        </div>
    );
};

export default OrderServiceData;