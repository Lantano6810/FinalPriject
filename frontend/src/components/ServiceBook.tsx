import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import "../styles/ServiceBook.css";

interface Application {
    id: number;
    client_name: string;
    client_phone: string;
    car_brand: string;
    car_model: string;
    car_year: number;
    work_description: string;
    status: string;
    appointment_date: string;
    serviceServiceId: number;
    service?: {
        service_name: string;
        city: string;
        address: string;
    };
}

const statusMap: Record<string, string> = {
    pending: "На рассмотрении",
    approved: "Подтверждена",
    completed: "Завершена",
    canceled: "Отменена",
};

const canBeCanceled = (status: string) => status === "pending" || status === "approved";

const ServiceBook: React.FC = () => {
    const userId = localStorage.getItem("user_id");
    const [applications, setApplications] = useState<Application[]>([]);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<Application>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            if (!userId) return;

            try {
                const res = await fetch(`http://localhost:3001/applications/user/${userId}`);
                if (!res.ok) throw new Error("Ошибка при получении заявок");

                const data: Application[] = await res.json();

                const appsWithService = await Promise.all(
                    data.map(async (app) => {
                        if (!app.serviceServiceId) return { ...app };

                        try {
                            const serviceRes = await fetch(`http://localhost:3001/services/${app.serviceServiceId}`);
                            const serviceData = await serviceRes.json();

                            return {
                                ...app,
                                service: {
                                    service_name: serviceData.service_name,
                                    city: serviceData.city,
                                    address: serviceData.address,
                                },
                            };
                        } catch {
                            return { ...app, service: undefined };
                        }
                    })
                );

                setApplications(appsWithService);
            } catch (err: any) {
                setError(err.message || "Произошла ошибка при загрузке заявок");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [userId]);

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const startEditing = (app: Application) => {
        setEditingId(app.id);
        setEditData({
            client_name: app.client_name,
            client_phone: app.client_phone,
            work_description: app.work_description,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSave = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:3001/applications/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editData),
            });

            if (!res.ok) throw new Error("Ошибка при сохранении");

            setApplications((prev) =>
                prev.map((a) => (a.id === id ? { ...a, ...editData } : a))
            );
            setEditingId(null);
        } catch (err: any) {
            alert(err.message || "Ошибка при сохранении");
        }
    };

    const handleCancelApplication = async (app: Application) => {
        const confirmed = window.confirm(`Вы уверены, что хотите отменить запись в "${app.service?.service_name}" на ${new Date(app.appointment_date).toLocaleDateString("ru-RU")}?`);
        if (!confirmed) return;

        try {
            const res = await fetch(`http://localhost:3001/applications/${app.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "canceled" }),
            });

            if (!res.ok) throw new Error("Ошибка при отмене");

            setApplications((prev) =>
                prev.map((a) => (a.id === app.id ? { ...a, status: "canceled" } : a))
            );
        } catch (err: any) {
            alert(err.message || "Ошибка при отмене");
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="service-book-container">
            <h2>Моя сервисная книжка</h2>
            {applications.length === 0 ? (
                <p>Заявок пока нет.</p>
            ) : (
                <table className="application-table expandable">
                    <thead>
                    <tr>
                        <th>Сервис</th>
                        <th>Город</th>
                        <th>Адрес</th>
                        <th>Дата</th>
                        <th>Статус</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map((app) => {
                        const isExpanded = expandedRows.includes(app.id);
                        const isEditing = editingId === app.id;

                        return (
                            <React.Fragment key={app.id}>
                                <tr className="main-row">
                                    <td>{app.service?.service_name || "—"}</td>
                                    <td>{app.service?.city || "—"}</td>
                                    <td>{app.service?.address || "—"}</td>
                                    <td>{new Date(app.appointment_date).toLocaleDateString("ru-RU")}</td>
                                    <td>
                                            <span className={`status-badge ${app.status}`}>
                                                {statusMap[app.status] || app.status}
                                            </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleRow(app.id)}
                                            className={`toggle-btn ${isExpanded ? "rotated" : ""}`}
                                            aria-label="Развернуть"
                                        >
                                            <FaChevronDown />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="expanded-row">
                                    <td colSpan={6}>
                                        <div className={`expandable-row-wrapper ${isExpanded ? "expanded" : ""}`}>
                                            {isExpanded && (
                                                <div className="expanded-content">
                                                    <p><strong>Авто:</strong> {app.car_brand} {app.car_model} ({app.car_year})</p>
                                                    <p><strong>Описание работы:</strong>{" "}
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editData.work_description || ""}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        work_description: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        ) : (
                                                            app.work_description
                                                        )}
                                                    </p>
                                                    <p><strong>Клиент:</strong>{" "}
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editData.client_name || ""}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        client_name: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        ) : (
                                                            app.client_name
                                                        )}
                                                    </p>
                                                    <p><strong>Телефон:</strong>{" "}
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editData.client_phone || ""}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        client_phone: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        ) : (
                                                            app.client_phone
                                                        )}
                                                    </p>

                                                    {!isEditing ? (
                                                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                                            <button onClick={() => startEditing(app)} className="edit-btn">
                                                                Редактировать
                                                            </button>
                                                            {canBeCanceled(app.status) && (
                                                                <button onClick={() => handleCancelApplication(app)} className="edit-btn" style={{ backgroundColor: "#d9534f" }}>
                                                                    Отменить запись
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="button-group">
                                                            <button onClick={() => handleSave(app.id)}>Сохранить</button>
                                                            <button onClick={cancelEditing}>Отмена</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ServiceBook;