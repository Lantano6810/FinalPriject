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
};

type PhotoMap = {
    [serviceId: number]: string[];
};

const AllServiceList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [photos, setPhotos] = useState<PhotoMap>({});
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [id: number]: number }>({});
    const [hoveredServiceId, setHoveredServiceId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 9;
    const navigate = useNavigate();

    const [cityFilter, setCityFilter] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchAddress, setSearchAddress] = useState("");
    const [searchWorks, setSearchWorks] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch("http://localhost:3001/services");
                if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
                const data = await response.json();
                setServices(data);
                setFilteredServices(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const fetchPhotos = async () => {
            const map: PhotoMap = {};
            for (const service of services) {
                try {
                    const res = await fetch(`http://localhost:3001/minio/photos/${service.service_id}`);
                    const data = await res.json();
                    map[service.service_id] = Array.isArray(data) ? data.map((p: any) => p.url) : [];
                } catch {
                    map[service.service_id] = [];
                }
            }
            setPhotos(map);
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
                    const current = prev[hoveredServiceId] || 0;
                    updated[hoveredServiceId] = (current + 1) % servicePhotos.length;
                }
                return updated;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [hoveredServiceId, photos]);

    useEffect(() => {
        let filtered = services;

        if (cityFilter) {
            filtered = filtered.filter(service => service.city.toLowerCase().includes(cityFilter.toLowerCase()));
        }
        if (searchName) {
            filtered = filtered.filter(service => service.service_name.toLowerCase().includes(searchName.toLowerCase()));
        }
        if (searchAddress) {
            filtered = filtered.filter(service => service.address?.toLowerCase().includes(searchAddress.toLowerCase()));
        }
        if (searchWorks) {
            filtered = filtered.filter(service =>
                service.works?.some(work => work.toLowerCase().includes(searchWorks.toLowerCase()))
            );
        }

        setFilteredServices(filtered);
        setCurrentPage(1);
    }, [cityFilter, searchName, searchAddress, searchWorks, services]);

    const resetFilters = () => {
        setCityFilter("");
        setSearchName("");
        setSearchAddress("");
        setSearchWorks("");
    };

    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка загрузки сервисов: {error}</p>;

    return (
        <div className="all-service-list">
            <h2 className="all-service-title">Список автосервисов</h2>

            <div className="filters">
                <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="filter-input">
                    <option value="">Выберите город</option>
                    {[...new Set(services.map(service => service.city))].map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <input type="text" placeholder="Поиск по названию" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="search-input" />
                <input type="text" placeholder="Поиск по адресу" value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} className="search-input" />
                <input type="text" placeholder="Поиск по услугам" value={searchWorks} onChange={(e) => setSearchWorks(e.target.value)} className="search-input" />
                <button className="reset-filters-button" onClick={resetFilters}>Сбросить фильтры</button>
            </div>

            {filteredServices.length === 0 ? (
                <p className="no-results">По вашему запросу ничего не найдено</p>
            ) : (
                <>
                    <div className="service-grid">
                        {currentServices.map(service => {
                            const servicePhotos = photos[service.service_id] || [];
                            const currentIndex = currentPhotoIndex[service.service_id] || 0;
                            const imageSrc = servicePhotos.length > 0 ? servicePhotos[currentIndex] : defaultServiceImage;

                            const worksText = service.works?.join(", ") || "Не указаны";
                            const shortWorks = worksText.length > 50 ? worksText.slice(0, 50) + "..." : worksText;

                            return (
                                <div
                                    key={service.service_id}
                                    className="service-card"
                                    onMouseEnter={() => setHoveredServiceId(service.service_id)}
                                    onMouseLeave={() => setHoveredServiceId(null)}
                                    onClick={() => navigate(`/services/${service.service_id}`)}
                                >
                                    <img src={imageSrc} alt={service.service_name} className="service-image" />
                                    <div className="service-info">
                                        <h3>{service.service_name}</h3>
                                        <p><strong>Город:</strong> {service.city}</p>
                                        <p><strong>Адрес:</strong> {service.address || "Не указан"}</p>
                                        <p><strong>Услуги:</strong> {shortWorks}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    className={`pagination-number ${currentPage === index + 1 ? "active" : ""}`}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AllServiceList;