import { useEffect, useState, forwardRef } from "react";
import { useParams } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale";
import { FaCalendarAlt } from "react-icons/fa";
import Modal from "../components/Modal";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/ServiceApplications.css";

registerLocale("ru", ru);

interface Application {
    id: number;
    user: { email: string };
    client_name: string;
    client_phone: string;
    car_brand: string;
    car_model: string;
    car_year: number;
    work_description: string;
    appointment_date: string;
    created_date: string;
    created_time: string;
    status: string;
}

interface Service {
    daily_limit: number;
}

const CustomDateInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
        <button className="custom-date-input" onClick={onClick} ref={ref}>
            <FaCalendarAlt className="calendar-icon" />
            <span>{value}</span>
        </button>
    )
);

const ServiceApplications = () => {
    const { id } = useParams();
    const serviceId = id ? Number(id) : null;
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dailyLimit, setDailyLimit] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userRole = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id") ? Number(localStorage.getItem("user_id")) : null;

    const statusTranslations: Record<string, string> = {
        pending: "На рассмотрении",
        approved: "Запись подтверждена",
        completed: "Отремонтировано",
        canceled: "Отменена"
    };

    useEffect(() => {
        const fetchApplications = async () => {
            if (!serviceId) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/applications/service/${serviceId}`);
                if (!res.ok) throw new Error("❌ Ошибка загрузки заявок");
                const data = await res.json();
                setApplications(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [serviceId]);

    useEffect(() => {
        const fetchServiceInfo = async () => {
            if (!serviceId) return;
            try {
                const res = await fetch(`http://localhost:3001/services/${serviceId}`);
                if (!res.ok) throw new Error("❌ Ошибка загрузки сервиса");
                const data: Service = await res.json();
                setDailyLimit(data.daily_limit);
            } catch (err) {
                console.error("Ошибка при загрузке информации о сервисе:", err);
            }
        };

        fetchServiceInfo();
    }, [serviceId]);

    const filteredApplications = applications.filter((app) => {
        const appDate = new Date(app.appointment_date).toLocaleDateString("en-CA");
        const selected = selectedDate.toLocaleDateString("en-CA");
        return appDate === selected;
    });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleConfirmBooking = async (formData: any) => {
        if (!userId || !serviceId) return;

        try {
            const response = await fetch("http://localhost:3001/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    serviceServiceId: serviceId,
                    client_name: formData.client_name,
                    client_phone: formData.client_phone,
                    car_brand: formData.car_brand,
                    car_model: formData.car_model,
                    car_year: Number(formData.car_year) || null,
                    work_description: formData.work_description,
                    appointment_date: formData.appointment_date || null,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка запроса: ${response.status} - ${errorText}`);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error("Ошибка при записи:", error);
        }
    };

    const isBookingAvailable =
        dailyLimit !== null && filteredApplications.length < dailyLimit;

    return (
        <div className="service-applications">
            <div className="applications-container-public">
                <h2>Заявки на выбранную дату</h2>

                <div className="date-limit-box">
                    <DatePicker
                        locale="ru"
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                            if (date) setSelectedDate(date);
                        }}
                        dateFormat="dd MMMM yyyy"
                        customInput={<CustomDateInput />}
                    />

                    {dailyLimit !== null && (
                        <p className="daily-limit-text">Лимит записей в день: {dailyLimit}</p>
                    )}
                </div>

                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p>Ошибка: {error}</p>
                ) : (
                    <div>
                        <p>🔍 Найдено заявок: {filteredApplications.length}</p>

                        {filteredApplications.length > 0 ? (
                            <table className="application-table">
                                <thead>
                                    <tr>
                                        <th>Марка авто</th>
                                        <th>Модель авто</th>
                                        <th>Год выпуска</th>
                                        <th>Описание работы</th>
                                        <th>Статус заявки</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app) => (
                                        <tr key={app.id}>
                                            <td>{app.car_brand}</td>
                                            <td>{app.car_model}</td>
                                            <td>{app.car_year}</td>
                                            <td>{app.work_description}</td>
                                            <td>{statusTranslations[app.status] || app.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>На выбранную дату записей нет. Вы можете записаться на обслуживание в сервис!</p>
                        )}
                    </div>
                )}

                {userRole === "car_owner" && (
                    isBookingAvailable ? (
                        <div className="booking-button-box">
                            <button className="btn book-btn" onClick={handleOpenModal}>
                                Записаться в сервис
                            </button>
                        </div>
                    ) : (
                        <p className="daily-limit-text">
                            Запись на этот день недоступна, так как лимит заявок в день исчерпан.
                        </p>
                    )
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmBooking}
                    selectedDate={selectedDate.toISOString().split("T")[0]}
                />
            </div>
        </div>
    );
};

export default ServiceApplications;
