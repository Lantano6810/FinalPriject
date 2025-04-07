import "../styles/HomeHero.css"; // Подключаем стили

const HomeHero = () => {
    return (
        <div className="home-hero">
            <div className="home-hero-content">
                <h1 className="home-hero-title">
                    Бронируйте очередь в автосервис за пару минут!
                </h1>
                <p className="home-hero-subtitle">
                    Просто выберите удобное время и ближайший автосервис, <br />
                    а всё остальное сделают специалисты.
                </p>
            </div>
        </div>
    );
};

export default HomeHero;