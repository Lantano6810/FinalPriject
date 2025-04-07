import HomeHero from "../components/HomeHero"; // ✅ Импортируем HomeHero
import HowWorks from "../components/HowWorks"; // ✅ Импортируем HowWorks
import ShortServiceList from "../components/ShortServiceList"; // ✅ Импортируем ShortServiceList
import AdTwo from "../components/AdTwo"; // ✅ Импортируем AdTwo

const Home = () => {
    return (
        <div>
            <HomeHero />
            <HowWorks />
            <ShortServiceList /> {/* ✅ Добавляем ShortServiceList после HowWorks */}
            <AdTwo />
        </div>
    );
};

export default Home;