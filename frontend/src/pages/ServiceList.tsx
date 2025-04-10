import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AllServiceList.css";
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

const SERVICES_PER_PAGE = 12;

const AllServiceList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [photos, setPhotos] = useState<PhotoMap>({});
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [id: number]: number }>({});
    const [hoveredServiceId, setHoveredServiceId] = useState<number | null>(null);

    const [searchName, setSearchName] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [searchWorks, setSearchWorks] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch("http://localhost:3001/services");
                if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
                const data = await response.json();
                const filtered = data.filter((service: Service) => service.data_filled === 1);
                setServices(filtered);
                setFilteredServices(filtered);
            } catch (error) {
                console.error("Ошибка загрузки сервисов:", error);
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

    useEffect(() => {
        let filtered = services;

        if (searchName.trim()) {
            filtered = filtered.filter((s) =>
                s.service_name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (selectedCity) {
            filtered = filtered.filter((s) => s.city === selectedCity);
        }

        if (searchWorks.trim()) {
            filtered = filtered.filter((s) =>
                (s.works || []).some((work) =>
                    work.toLowerCase().includes(searchWorks.toLowerCase())
                )
            );
        }

        setFilteredServices(filtered);
        setCurrentPage(1); // Сброс страницы при фильтрации
    }, [searchName, selectedCity, searchWorks, services]);

    const getCities = () => {
        const citySet = new Set(services.map((s) => s.city));
        return Array.from(citySet);
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
    };

    const resetAllFilters = () => {
        setSearchName("");
        setSelectedCity("");
        setSearchWorks("");
    };

    const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * SERVICES_PER_PAGE,
        currentPage * SERVICES_PER_PAGE
    );

    return (
        <div className="all-service-list">
            <h2 className="all-service-title">Все автосервисы</h2>

            {/* 🔍 Фильтры */}
            <div className="filters">
                <div className="filter-wrapper">
                    <input
                        type="text"
                        placeholder="Поиск по названию"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    {searchName && (
                        <span className="clear-icon" onClick={() => setSearchName("")}>✖</span>
                    )}
                </div>

                <div className="filter-wrapper">
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                        <option value="">Все города</option>
                        {getCities().map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    {selectedCity && (
                        <span className="clear-icon" onClick={() => setSelectedCity("")}>✖</span>
                    )}
                </div>

                <div className="filter-wrapper">
                    <input
                        type="text"
                        placeholder="Поиск по услугам"
                        value={searchWorks}
                        onChange={(e) => setSearchWorks(e.target.value)}
                    />
                    {searchWorks && (
                        <span className="clear-icon" onClick={() => setSearchWorks("")}>✖</span>
                    )}
                </div>

                <button className="clear-all-btn" onClick={resetAllFilters}>Сбросить все</button>
            </div>

            {/* 📋 Список */}
            <div className="service-grid">
                {paginatedServices.map((service) => {
                    const servicePhotos = photos[service.service_id] || [];
                    const currentIndex = currentPhotoIndex[service.service_id] || 0;
                    const imageSrc = servicePhotos.length > 0 ? servicePhotos[currentIndex] : defaultServiceImage;

                    const worksText = service.works?.join(", ") || "Не указаны";
                    const truncatedWorks = truncateText(worksText, 70);

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

            {/* 🔁 Пагинация */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`pagination-number ${currentPage === i + 1 ? "active" : ""}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllServiceList;
