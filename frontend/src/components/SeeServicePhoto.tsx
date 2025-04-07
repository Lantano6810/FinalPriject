import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/SeeServicePhoto.css";

type Photo = {
    id: number;
    url: string;
};

const SeeServicePhoto = () => {
    const { id } = useParams();
    const serviceId = id ? Number(id) : null;

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string>("");
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        const fetchPhotos = async () => {
            if (!serviceId) return;
            try {
                const response = await fetch(`http://localhost:3001/minio/photos/${serviceId}`);
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setPhotos(data);
                    setSelectedPhoto(data[0].url);
                    setCurrentIndex(0);
                } else {
                    setPhotos([]);
                    setSelectedPhoto("");
                }
            } catch (err) {
                console.error("Ошибка загрузки фото:", err);
                setPhotos([]);
            }
        };

        fetchPhotos();
    }, [serviceId]);

    const goToNextPhoto = () => {
        if (photos.length === 0) return;
        const nextIndex = (currentIndex + 1) % photos.length;
        setSelectedPhoto(photos[nextIndex].url);
        setCurrentIndex(nextIndex);
    };

    const goToPrevPhoto = () => {
        if (photos.length === 0) return;
        const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
        setSelectedPhoto(photos[prevIndex].url);
        setCurrentIndex(prevIndex);
    };

    return (
        <div className="photo-viewer-container">
            {photos.length === 0 ? (
                <p className="no-photos-message">Фото автосервиса отсутствуют</p>
            ) : (
                <>
                    {selectedPhoto && (
                        <div className="main-photo-wrapper">
                            <button className="nav-button outside left" onClick={goToPrevPhoto}>◀</button>

                            <div className="main-photo-box">
                                <img src={selectedPhoto} alt="Selected" className="main-photo" />
                            </div>

                            <button className="nav-button outside right" onClick={goToNextPhoto}>▶</button>
                        </div>
                    )}

                    <div className="thumbnail-container">
                        {photos.map((photo, index) => (
                            <img
                                key={photo.id}
                                src={photo.url}
                                alt="Thumbnail"
                                className={`thumbnail ${selectedPhoto === photo.url ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedPhoto(photo.url);
                                    setCurrentIndex(index);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SeeServicePhoto;