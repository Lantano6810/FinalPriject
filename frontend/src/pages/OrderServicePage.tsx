import { useEffect } from "react";
import OrderServiceData from "../components/OrderServiceData";
import "../styles/ServicePage.css";

const OrderServicePage = () => {
    useEffect(() => {
        document.body.classList.add("service-page");
        return () => document.body.classList.remove("service-page");
    }, []);

    return (
        <>
            <div className="service-container">
                <h2>Данные сервиса</h2>
                <OrderServiceData /> {/* ❌ Убрали передачу `serviceId` */}
            </div>
        </>
    );
};

export default OrderServicePage;