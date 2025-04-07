import React, { useEffect, useState } from "react";
import "../styles/UserData.css";

const UserData: React.FC = () => {
    const userId = localStorage.getItem("user_id");
    const [userData, setUserData] = useState({ name: "" });
    const [isEditingName, setIsEditingName] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`http://localhost:3001/users/${userId}`);
                const data = await res.json();
                setUserData({ name: data.name });
            } catch (err) {
                console.error("Ошибка при загрузке пользователя:", err);
            }
        };

        fetchUser();
    }, [userId]);

    const handleSaveName = async () => {
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`http://localhost:3001/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: userData.name }),
            });

            if (!res.ok) {
                setError("Не удалось обновить имя.");
                return;
            }

            setSuccess("Имя успешно обновлено.");
            setIsEditingName(false);
        } catch (err) {
            setError("Ошибка при обновлении имени.");
        }
    };

    const handleSavePassword = async () => {
        setError("");
        setSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Заполните все поля для смены пароля.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Новые пароли не совпадают.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/users/${userId}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Ошибка при обновлении пароля.");
            }

            setSuccess("Пароль успешно обновлён.");
            setIsChangingPassword(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "Ошибка при смене пароля.");
        }
    };

    return (
        <div className="user-data-container">
            <h2>Данные пользователя</h2>

            {/* Имя пользователя */}
            <label>Имя:</label>
            {!isEditingName ? (
                <div className="name-display">
                    <span>{userData.name}</span>
                    <button onClick={() => setIsEditingName(true)}>Редактировать</button>
                </div>
            ) : (
                <div className="edit-name-block">
                    <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                    <button onClick={handleSaveName}>Сохранить</button>
                    <button onClick={() => setIsEditingName(false)}>Отмена</button>
                </div>
            )}

            {/* Кнопка изменения пароля */}
            {!isChangingPassword ? (
                <button
                    className="change-password-btn"
                    onClick={() => setIsChangingPassword(true)}
                    style={{ marginTop: "20px" }}
                >
                    Изменить пароль
                </button>
            ) : (
                <div className="change-password-form">
                    <label>Старый пароль:</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />

                    <label>Новый пароль:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <label>Повторите новый пароль:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className="button-group">
                        <button onClick={handleSavePassword}>Сохранить пароль</button>
                        <button onClick={() => setIsChangingPassword(false)}>Отмена</button>
                    </div>
                </div>
            )}

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
    );
};

export default UserData;