import AdOneIcon from "../assets/AdOneIcon.png"; // Импортируем картинку

const AdOne = () => {
    return (
        <div
            style={{
                backgroundColor: "#106980",
                height: "144px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: "0 20px",
            }}
        >
            <img
                src={AdOneIcon}
                alt="Иконка"
                style={{ width: "50px", height: "50px", marginRight: "15px" }}
            />
            <div>
                <h2 style={{ fontSize: "20px", margin: 0 }}>Доступ за пару минут!</h2>
                <p style={{ fontSize: "14px", margin: "5px 0 0" }}>
                    Не тратьте время зря — ваш автомобиль уже ждёт заботы.
                    Завершите вход и начните прямо сейчас!
                </p>
            </div>
        </div>
    );
};

export default AdOne;