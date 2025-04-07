import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ShortServiceList.css";
import defaultServiceImage from "../assets/default-service.png";

type Service = {
    service_id: number;
    service_name: string;
    city: string;
    address?: string;
    works?: string[];
    data_filled?: number;
};

type PhotoMap = {
    [serviceId: number]: string[];
};

const ShortServiceList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [photos, setPhotos] = useState<PhotoMap>({});
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [id: number]: number }>({});
    const [hoveredServiceId, setHoveredServiceId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch("http://localhost:3001/services");
                if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
                const data = await response.json();

                // ✅ Фильтруем только те сервисы, у которых data_filled === 1
                const filtered = data.filter((service: Service) => service.data_filled === 1);
                setServices(filtered.slice(0, 6));
            } catch (err: any) {
                console.error(err);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const fetchPhotos = async () => {
            const photoMap: PhotoMap = {};
            for (const service of services) {
                try {
                    const res = await fetch(`http://localhost:3001/minio/photos/${service.service_id}`);
                    const data = await res.json();
                    photoMap[service.service_id] = Array.isArray(data) ? data.map((p: any) => p.url) : [];
                } catch {
                    photoMap[service.service_id] = [];
                }
            }
            setPhotos(photoMap);
        };

        if (services.length > 0) fetchPhotos();
    }, [services]);

    useEffect(() => {
        if (!hoveredServiceId) return;

        const interval = setInterval(() => {
            setCurrentPhotoIndex((prev) => {
                const updated = { ...prev };
                const servicePhotos = photos[hoveredServiceId];
                if (servicePhotos && servicePhotos.length > 1) {
                    const currentIndex = prev[hoveredServiceId] || 0;
                    updated[hoveredServiceId] = (currentIndex + 1) % servicePhotos.length;
                }
                return updated;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [hoveredServiceId, photos]);

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
    };

    return (
        <div className="short-service-list">
            <h2 className="short-service-title">Список сервисов</h2>
            <div className="service-grid">
                {services.map((service) => {
                    const servicePhotos = photos[service.service_id] || [];
                    const currentIndex = currentPhotoIndex[service.service_id] || 0;
                    const imageSrc = servicePhotos.length > 0 ? servicePhotos[currentIndex] : defaultServiceImage;

                    const worksText = service.works?.join(", ") || "Не указаны";
                    const truncatedWorks = truncateText(worksText, 50);

                    return (
                        <div
                            key={service.service_id}
                            className="service-card"
                            onMouseEnter={() => setHoveredServiceId(service.service_id)}
                            onMouseLeave={() => setHoveredServiceId(null)}
                            onClick={() => navigate(`/services/${service.service_id}`)}
                        >
                            <div className="image-wrapper">
                                <img src={imageSrc} alt={service.service_name} className="service-image fade-swipe" />
                            </div>
                            <div className="service-info">
                                <h3>{service.service_name}</h3>
                                <p><strong>Город:</strong> {service.city}</p>
                                <p><strong>Адрес:</strong> {service.address || "Не указан"}</p>
                                <p><strong>Услуги:</strong> {truncatedWorks}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="see-all-container">
                <button className="see-all-button" onClick={() => navigate("/services")}>
                    Смотреть весь список
                </button>
            </div>
        </div>
    );
};

export default ShortServiceList;
