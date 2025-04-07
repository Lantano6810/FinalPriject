import "../styles/HowWorks.css"; // Подключаем стили
import step1Img from "../assets/step1.png"; // Импортируем изображение для шага 1
import step2Img from "../assets/step2.png"; // Импортируем изображение для шага 2
import step3Img from "../assets/step3.png"; // Импортируем изображение для шага 3

const HowWorks = () => {
    const steps = [
        { img: step1Img, title: "Регистрация", description: "Зарегистрируйтесь на сайте" },
        { img: step2Img, title: "Выбор сервиса", description: "Найдите подходящий автосервис" },
        { img: step3Img, title: "Запись онлайн", description: "Запишитесь на удобное время" }
    ];

    return (
        <div className="how-works">
            <h2 className="how-works-title">Как это работает?</h2>
            <div className="how-works-container">
                {steps.map((step, index) => (
                    <div className="how-works-box" key={index}>
                        <img src={step.img} alt="Шаг" className="how-works-img" />
                        <h3 className="how-works-step">{step.title}</h3>
                        <p className="how-works-text">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HowWorks;