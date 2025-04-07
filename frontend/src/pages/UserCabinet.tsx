import UserData from "../components/UserData";
import ServiceBook from "../components/ServiceBook"; // убедись, что путь правильный

const UserCabinet = () => {
    return (
        <div style={{ padding: "20px" }}>
            <UserData />
            <hr style={{ margin: "40px 0" }} />
            <ServiceBook />
        </div>
    );
};

export default UserCabinet;