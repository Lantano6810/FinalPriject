import React, { useState, useEffect } from "react";
// @ts-ignore
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.kz";
import "../styles/Modal.css";
import carList from "../data/car-list.json";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (formData: any) => void;
    selectedDate: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, selectedDate }) => {
    const [formData, setFormData] = useState({
        client_name: "",
        client_phone: "",
        car_brand: "",
        car_model: "",
        car_year: "",
        work_description: "",
        appointment_date: "",
    });

    const [brandQuery, setBrandQuery] = useState("");
    const [modelQuery, setModelQuery] = useState("");
    const [yearQuery, setYearQuery] = useState("");
    const [showBrandOptions, setShowBrandOptions] = useState(false);
    const [showModelOptions, setShowModelOptions] = useState(false);
    const [showYearOptions, setShowYearOptions] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            setFormData((prev) => ({
                ...prev,
                appointment_date: selectedDate,
            }));
        }
    }, [selectedDate]);

    const filteredBrands = carList
        .map((item) => item.brand)
        .filter((brand) => brand.toLowerCase().includes(brandQuery.toLowerCase()));

    const selectedBrand = carList.find((item) => item.brand === formData.car_brand);
    const filteredModels = selectedBrand
        ? selectedBrand.models.filter((model) =>
            model.toLowerCase().includes(modelQuery.toLowerCase())
        )
        : [];

    const currentYear = new Date().getFullYear();
    const allYears = Array.from({ length: currentYear - 1979 }, (_, i) => (1980 + i).toString()).reverse();
    const filteredYears = allYears.filter((year) =>
        year.toLowerCase().includes(yearQuery.toLowerCase())
    );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        type: "brand" | "model" | "year"
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (type === "brand" && filteredBrands[0]) {
                setFormData((prev) => ({
                    ...prev,
                    car_brand: filteredBrands[0],
                    car_model: "",
                }));
                setBrandQuery(filteredBrands[0]);
                setShowBrandOptions(false);
            }
            if (type === "model" && filteredModels[0]) {
                setFormData((prev) => ({
                    ...prev,
                    car_model: filteredModels[0],
                }));
                setModelQuery(filteredModels[0]);
                setShowModelOptions(false);
            }
            if (type === "year" && filteredYears[0]) {
                setFormData((prev) => ({
                    ...prev,
                    car_year: filteredYears[0],
                }));
                setYearQuery(filteredYears[0]);
                setShowYearOptions(false);
            }
        }
    };

    const handleSubmit = () => {
        try {
            const updatedFormData = {
                ...formData,
                car_year: formData.car_year ? Number(formData.car_year) : null,
            };

            console.log("✅ Отправляем форму:", updatedFormData);
            onConfirm(updatedFormData);
            window.location.reload();
        } catch (err) {
            console.error("❌ Ошибка при отправке формы:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Запись в автосервис</h2>

                <div className="appointment-date-text">
                    {formData.appointment_date
                        ? `Дата записи: ${new Date(formData.appointment_date).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })} `
                        : "Дата не выбрана"}
                </div>

                {/* Имя и Телефон */}
                <div className="row two-columns">
                    <div>
                        <label>Имя:</label>
                        <input
                            type="text"
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Телефон:</label>
                        <Cleave
                            name="client_phone"
                            options={{
                                prefix: "+7",
                                blocks: [2, 3, 3, 2, 2],
                                delimiters: [" ", " ", "-", "-"],
                                numericOnly: true,
                                noImmediatePrefix: false,
                            }}
                            value={formData.client_phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    client_phone: e.target.value,
                                }))
                            }
                            placeholder="+7 777 777-77-77"
                        />
                    </div>
                </div>

                {/* Марка, модель и год */}
                <div className="row three-columns">
                    {/* Марка */}
                    <div>
                        <label>Марка авто:</label>
                        <div className="custom-select">
                            <input
                                type="text"
                                placeholder="Введите марку"
                                value={brandQuery || formData.car_brand}
                                onFocus={() => setShowBrandOptions(true)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setBrandQuery(value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        car_brand: value,
                                        car_model: "",
                                    }));
                                }}
                                onBlur={() => setTimeout(() => setShowBrandOptions(false), 100)}
                                onKeyDown={(e) => handleKeyDown(e, "brand")}
                            />
                            {showBrandOptions && (
                                <div className="select-options">
                                    {filteredBrands.length > 0 ? (
                                        filteredBrands.map((brand) => (
                                            <div
                                                key={brand}
                                                className="select-option"
                                                onMouseDown={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        car_brand: brand,
                                                        car_model: "",
                                                    }));
                                                    setBrandQuery(brand);
                                                    setShowBrandOptions(false);
                                                }}
                                            >
                                                {brand}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="select-option no-match">Совпадений не найдено</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Модель */}
                    <div>
                        <label>Модель авто:</label>
                        <div className="custom-select">
                            <input
                                type="text"
                                placeholder="Введите модель"
                                value={modelQuery || formData.car_model}
                                disabled={!formData.car_brand}
                                onFocus={() => setShowModelOptions(true)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setModelQuery(value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        car_model: value,
                                    }));
                                }}
                                onBlur={() => setTimeout(() => setShowModelOptions(false), 100)}
                                onKeyDown={(e) => handleKeyDown(e, "model")}
                            />
                            {showModelOptions && formData.car_brand && (
                                <div className="select-options">
                                    {filteredModels.length > 0 ? (
                                        filteredModels.map((model) => (
                                            <div
                                                key={model}
                                                className="select-option"
                                                onMouseDown={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        car_model: model,
                                                    }));
                                                    setModelQuery(model);
                                                    setShowModelOptions(false);
                                                }}
                                            >
                                                {model}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="select-option no-match">Совпадений не найдено</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Год */}
                    <div>
                        <label>Год выпуска:</label>
                        <div className="custom-select">
                            <input
                                type="text"
                                placeholder="Введите год"
                                value={yearQuery || formData.car_year}
                                onFocus={() => setShowYearOptions(true)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setYearQuery(value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        car_year: value,
                                    }));
                                }}
                                onBlur={() => setTimeout(() => setShowYearOptions(false), 100)}
                                onKeyDown={(e) => handleKeyDown(e, "year")}
                            />
                            {showYearOptions && (
                                <div className="select-options">
                                    {filteredYears.length > 0 ? (
                                        filteredYears.map((year) => (
                                            <div
                                                key={year}
                                                className="select-option"
                                                onMouseDown={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        car_year: year,
                                                    }));
                                                    setYearQuery(year);
                                                    setShowYearOptions(false);
                                                }}
                                            >
                                                {year}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="select-option no-match">Совпадений не найдено</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Описание работ */}
                <label>Описание работ:</label>
                <textarea
                    name="work_description"
                    value={formData.work_description}
                    onChange={handleInputChange}
                ></textarea>

                {/* Кнопки */}
                <div className="modal-buttons">
                    <button className="btn confirm-btn" onClick={handleSubmit}>
                        Записаться
                    </button>
                    <button className="btn cancel-btn" onClick={onClose}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
