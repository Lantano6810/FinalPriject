import { useState } from "react";
import MyServiceData from "../components/MyServiceData";
import UploadPhoto from "../components/UploadPhotos";

const FillServiceData = () => {
    const [step, setStep] = useState(1);

    const handleNext = () => {
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Заполнение данных сервиса</h2>

            {step === 1 && (
                <>
                    <MyServiceData />
                    <div className="text-center mt-4">
                        <button className="btn btn-primary" onClick={handleNext}>
                            Далее
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <UploadPhoto />
                    <div className="text-center mt-4">
                        <button className="btn btn-secondary me-2" onClick={handleBack}>
                            Назад
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FillServiceData;