import { useEffect, useState } from "react";
import "../styles/MyServiceData.css";

const kazakhstanCities = [
    "Алматы", "Астана", "Шымкент", "Актобе", "Караганда",
    "Тараз", "Уральск", "Павлодар", "Семей", "Костанай",
    "Кызылорда", "Актау", "Атырау", "Петропавловск", "Экибастуз",
    "Темиртау", "Талдыкорган", "Кокшетау", "Жезказган", "Риддер"
];

const MyServiceData = () => {
    const [serviceData, setServiceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState<any>({});
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            setError("Не найден user_id в localStorage");
            setLoading(false);
            return;
        }

        const fetchServiceData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/services/user/${userId}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Ошибка загрузки: ${response.status} ${response.statusText}`, errorText);
                    throw new Error(`Ошибка загрузки (${response.status}): ${response.statusText}`);
                }
                const data = await response.json();
                setServiceData(data);
                setEditedData({
                    ...data,
                    works: Array.isArray(data.works) ? data.works.join(", ") : "",
                });
            } catch (err: any) {
                console.error("Ошибка при получении данных:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, []);

    const handleEditClick = () => setEditing(true);
    const handleCancelEdit = () => {
        setEditing(false);
        setEditedData({
            ...serviceData,
            works: Array.isArray(serviceData.works) ? serviceData.works.join(", ") : "",
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedData((prev: any) => ({
            ...prev,
            [name]: name === "daily_limit" ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        try {
            const updatedData = {
                ...editedData,
                works: editedData.works.split(",").map((item: string) => item.trim()),
                daily_limit: Number(editedData.daily_limit),
                data_filled: 1, // Изменено поле data_filled на 1
            };

            const response = await fetch(`http://localhost:3001/services/${serviceData?.service_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Ошибка обновления: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Ошибка обновления (${response.status}): ${response.statusText}`);
            }

            const updatedService = await response.json();
            setServiceData(updatedService);
            setEditing(false);
        } catch (err: any) {
            console.error("Ошибка при сохранении:", err);
            setError(err.message);
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="service-data-container">
            <h2 className="service-title">
                {editing ? (
                    <input
                        type="text"
                        name="service_name"
                        value={editedData.service_name || ""}
                        onChange={handleChange}
                    />
                ) : (
                    serviceData?.service_name
                )}
            </h2>

            <div className="service-grid">
                <div className="service-info">
                    <label>Город:</label>
                    {editing ? (
                        <select name="city" value={editedData.city || ""} onChange={handleChange}>
                            <option value="">Выберите город</option>
                            {kazakhstanCities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span>{serviceData?.city || "Не указан"}</span>
                    )}
                </div>

                <div className="service-info">
                    <label>Адрес:</label>
                    {editing ? (
                        <input
                            type="text"
                            name="address"
                            value={editedData.address || ""}
                            onChange={handleChange}
                        />
                    ) : (
                        <span>{serviceData?.address || "Не указан"}</span>
                    )}
                </div>

                <div className="service-info full-width">
                    <label>Услуги оказываемые автосервисом:</label>
                    {editing ? (
                        <textarea
                            name="works"
                            value={editedData.works || ""}
                            onChange={handleChange}
                        />
                    ) : (
                        <span>{serviceData?.works?.join(", ") || "Не указаны"}</span>
                    )}
                </div>

                <div className="service-info">
                    <label>Время начала работы:</label>
                    {editing ? (
                        <input
                            type="time"
                            name="time_start"
                            value={editedData.time_start || ""}
                            onChange={handleChange}
                        />
                    ) : (
                        <span>{serviceData?.time_start || "Не указано"}</span>
                    )}
                </div>

                <div className="service-info">
                    <label>Время окончания работы:</label>
                    {editing ? (
                        <input
                            type="time"
                            name="time_end"
                            value={editedData.time_end || ""}
                            onChange={handleChange}
                        />
                    ) : (
                        <span>{serviceData?.time_end || "Не указано"}</span>
                    )}
                </div>

                <div className="service-info">
                    <label>Лимит заявок в день:</label>
                    {editing ? (
                        <input
                            type="number"
                            name="daily_limit"
                            value={editedData.daily_limit || 0}
                            onChange={handleChange}
                        />
                    ) : (
                        <span>{serviceData?.daily_limit}</span>
                    )}
                </div>
            </div>

            <div className="edit-buttons">
                {userId && serviceData?.user?.id?.toString() === userId ? (
                    editing ? (
                        <>
                            <button className="btn-save" onClick={handleSave}>
                                Сохранить
                            </button>
                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                Отмена
                            </button>
                        </>
                    ) : (
                        <button className="btn-edit" onClick={handleEditClick}>
                            Редактировать
                        </button>
                    )
                ) : (
                    <p className="no-access">Вы не можете редактировать этот сервис.</p>
                )}
            </div>
        </div>
    );
};

export default MyServiceData;
