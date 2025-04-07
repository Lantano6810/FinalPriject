import { useEffect, useState } from "react";
import "../styles/MyServiceApplications.css";

interface Application {
    id: number;
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

const statusTranslations: Record<string, string> = {
    pending: "На рассмотрении",
    approved: "Запись подтверждена",
    completed: "Отремонтировано",
    canceled: "Отменена"
};

const formatDateParts = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
        full: date.toLocaleDateString("ru-RU"),
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        day: date.getDate().toString().padStart(2, "0"),
    };
};

const getMonthName = (monthNumber: string) => {
    const months = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];
    const index = parseInt(monthNumber, 10) - 1;
    return months[index] || monthNumber;
};

const formatDayWithMonthName = (day: string, monthNumber: string) => {
    const dayNumber = parseInt(day, 10);
    const monthName = getMonthName(monthNumber).toLowerCase();
    return `${dayNumber} ${monthName}`;
};

const MyServiceApplications = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeYear, setActiveYear] = useState<string>("");
    const [activeMonth, setActiveMonth] = useState<string>("");
    const [activeDay, setActiveDay] = useState<string>("");

    const [expandedAppId, setExpandedAppId] = useState<number | null>(null);

    const serviceId = localStorage.getItem("service_id");

    useEffect(() => {
        const fetchApplications = async () => {
            if (!serviceId) return;

            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/applications/service/${serviceId}`);
                if (!res.ok) throw new Error("❌ Ошибка загрузки заявок");
                const data: Application[] = await res.json();

                const sorted = data.sort((a, b) =>
                    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
                );
                setApplications(sorted);

                if (sorted.length > 0) {
                    const today = new Date();
                    let closestApp = sorted[0];
                    let closestDiff = Math.abs(today.getTime() - new Date(sorted[0].appointment_date).getTime());

                    for (const app of sorted) {
                        const diff = Math.abs(today.getTime() - new Date(app.appointment_date).getTime());
                        if (diff < closestDiff) {
                            closestApp = app;
                            closestDiff = diff;
                        }
                    }

                    const { year, month, day } = formatDateParts(closestApp.appointment_date);
                    setActiveYear(year);
                    setActiveMonth(month);
                    setActiveDay(day);
                }
            } catch (err: any) {
                setError(err.message || "Неизвестная ошибка");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [serviceId]);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:3001/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Ошибка обновления статуса");

            setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        } catch (err) {
            console.error("Ошибка смены статуса", err);
        }
    };

    const formatCreatedDate = (date: string, time: string) => {
        const dateTime = new Date(`${date}T${time}`);
        return {
            date: dateTime.toLocaleDateString("ru-RU"),
            time: dateTime.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };
    };

    const dateMap = applications.reduce((acc: Record<string, Record<string, string[]>>, app) => {
        const { year, month, day } = formatDateParts(app.appointment_date);
        if (!acc[year]) acc[year] = {};
        if (!acc[year][month]) acc[year][month] = [];
        if (!acc[year][month].includes(day)) acc[year][month].push(day);
        return acc;
    }, {});

    const filteredApplications = applications.filter((app) => {
        const { year, month, day } = formatDateParts(app.appointment_date);
        return year === activeYear && month === activeMonth && day === activeDay;
    });

    const renderStatusTrack = (status: string) => {
        if (status === "canceled") {
            return (
                <div className="status-track canceled-track">
                    <div className="status-step canceled">
                        <div className="status-circle">✖</div>
                        <div className="status-label">Заявка отменена</div>
                    </div>
                </div>
            );
        }

        const steps = ["На рассмотрении", "Запись подтверждена", "Отремонтировано"];
        const currentIndex = steps.findIndex(s => s === statusTranslations[status]);

        return (
            <div className="status-track">
                {steps.map((step, index) => {
                    const isPassed = index < currentIndex;
                    const isActive = index === currentIndex;
                    return (
                        <div key={index} className={`status-step ${isPassed ? "passed" : ""} ${isActive ? "active" : ""}`}>
                            <div className="status-circle" />
                            <div className="status-label">{step}</div>
                            {index < steps.length - 1 && <div className="status-line" />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="applications-container">
            {loading ? (
                <p>Загрузка заявок...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : applications.length === 0 ? (
                <p>К сожалению, в ваш сервис еще не поступали заявки на обслуживание.</p>
            ) : (
                <>
                    {/* Вкладки по годам/месяцам/дням */}
                    <div className="date-tabs">
                        {Object.keys(dateMap).map((year) => (
                            <button
                                key={year}
                                className={year === activeYear ? "tab active" : "tab"}
                                onClick={() => {
                                    setActiveYear(year);
                                    const months = Object.keys(dateMap[year]);
                                    const firstMonth = months[0];
                                    const firstDay = dateMap[year][firstMonth][0];
                                    setActiveMonth(firstMonth);
                                    setActiveDay(firstDay);
                                }}
                            >
                                {`${year} год`}
                            </button>
                        ))}
                    </div>

                    <div className="date-tabs">
                        {activeYear && Object.keys(dateMap[activeYear]).map((month) => (
                            <button
                                key={month}
                                className={month === activeMonth ? "tab active" : "tab"}
                                onClick={() => {
                                    setActiveMonth(month);
                                    const firstDay = dateMap[activeYear][month][0];
                                    setActiveDay(firstDay);
                                }}
                            >
                                {getMonthName(month)}
                            </button>
                        ))}
                    </div>

                    <div className="date-tabs">
                        {activeYear && activeMonth && dateMap[activeYear][activeMonth].map((day) => (
                            <button
                                key={day}
                                className={day === activeDay ? "tab active" : "tab"}
                                onClick={() => setActiveDay(day)}
                            >
                                {formatDayWithMonthName(day, activeMonth)}
                            </button>
                        ))}
                    </div>

                    <table className="application-table">
                        <thead>
                        <tr>
                            <th>Автомобиль</th>
                            <th>Описание</th>
                            <th>Статус</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredApplications.map((app) => {
                            const isExpanded = expandedAppId === app.id;
                            const { date, time } = formatCreatedDate(app.created_date, app.created_time);

                            return (
                                <>
                                    <tr key={app.id}>
                                        <td>{`${app.car_brand} ${app.car_model} ${app.car_year}`}</td>
                                        <td>{app.work_description}</td>
                                        <td>
                                            <span className={`status-cell status-${app.status}`}>
                                                {statusTranslations[app.status] || app.status}
                                            </span>
                                        </td>
                                        <td
                                            style={{ cursor: "pointer", textAlign: "center" }}
                                            onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                                        >
                                            {isExpanded ? "▲" : "▼"}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={4} className="expanded-row">
                                                <div className="expanded-content">
                                                    <div className="expanded-line">
                                                        <p><strong>Имя клиента:</strong> {app.client_name}</p>
                                                        <p><strong>Телефон:</strong> {app.client_phone}</p>
                                                    </div>
                                                    <div className="expanded-line">
                                                        <p><strong>Дата создания:</strong> {date}</p>
                                                        <p><strong>Время создания:</strong> {time}</p>
                                                    </div>
                                                    <div className="expanded-line">
                                                        <strong>Ход заявки:</strong>
                                                        {renderStatusTrack(app.status)}
                                                    </div>
                                                    {app.status === "pending" && (
                                                        <div className="expanded-line">
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm("Вы уверены, что хотите подтвердить запись?")) {
                                                                        handleStatusUpdate(app.id, "approved");
                                                                    }
                                                                }}
                                                            >
                                                                Записать
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm("Вы уверены, что хотите отклонить запись?")) {
                                                                        handleStatusUpdate(app.id, "canceled");
                                                                    }
                                                                }}
                                                            >
                                                                Отклонить
                                                            </button>
                                                        </div>
                                                    )}
                                                    {app.status === "approved" && (
                                                        <div className="expanded-line">
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm("Подтвердите завершение ремонта.")) {
                                                                        handleStatusUpdate(app.id, "completed");
                                                                    }
                                                                }}
                                                            >
                                                                Завершить ремонт
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default MyServiceApplications;