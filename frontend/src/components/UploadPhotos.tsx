import { useState, useEffect } from "react";

type Photo = {
    id: number;
    url: string;
};

const UploadPhotos = () => {
    const serviceId = localStorage.getItem("service_id");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editMode, setEditMode] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const filesArray = Array.from(event.target.files || []);
        setSelectedFiles(filesArray);
        setPreviewUrls(filesArray.map((file) => URL.createObjectURL(file)));
    };

    const handleUpload = async () => {
        if (!selectedFiles.length || !serviceId) {
            alert("Выберите файлы и убедитесь, что у вас есть service_id");
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bucketName", "avatars");
            formData.append("service_id", serviceId);

            try {
                const response = await fetch("http://localhost:3001/minio/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();
                setUploadedPhotos((prev) => [...prev, { id: data.id, url: data.url }]);
                setUploadProgress(((i + 1) / selectedFiles.length) * 100);
            } catch (error) {
                console.error("Ошибка загрузки:", error);
            }
        }

        setSelectedFiles([]);
        setPreviewUrls([]);
        setLoading(false);
        setUploadProgress(100);
        fetchPhotos();
    };

    const fetchPhotos = async () => {
        if (!serviceId) return;
        try {
            const response = await fetch(`http://localhost:3001/minio/photos/${serviceId}`);
            const data = await response.json();
            setUploadedPhotos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Ошибка загрузки фото:", error);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [serviceId]);

    const handleDeletePhoto = async (photoId?: number) => {
        const isConfirmed = window.confirm("Вы уверены, что хотите удалить фото?");
        if (!isConfirmed || !photoId) return;

        try {
            await fetch(`http://localhost:3001/minio/delete/${photoId}`, {
                method: "DELETE",
            });
            setUploadedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
        } catch (error) {
            console.error("Ошибка удаления фото:", error);
        }
    };

    return (
        <div className="upload-container">
            {/*<h2>Фото сервиса</h2>*/}

            <div className="photos-header">
                <h3>Загруженные фото ({uploadedPhotos.length})</h3>
                <button className="edit-toggle-btn" onClick={() => setEditMode((prev) => !prev)}>
                    {editMode ? "Закончить редактирование" : "Редактировать фото"}
                </button>
            </div>

            {editMode && (
                <>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} />

                    {previewUrls.length > 0 && (
                        <div className="preview-container">
                            <p>Предпросмотр:</p>
                            <div className="preview-images">
                                {previewUrls.map((url, index) => (
                                    <img key={index} src={url} alt={`preview-${index}`} className="preview-image" />
                                ))}
                            </div>
                            <button onClick={handleUpload} disabled={loading} className="upload-btn">
                                {loading ? `Загрузка... ${Math.round(uploadProgress)}%` : "Загрузить все фото"}
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}
                </>
            )}

            <div className="photo-block">
                <div className="photo-grid">
                    {uploadedPhotos.map((photo) => (
                        <div key={photo.id} className="photo-item">
                            <img src={photo.url} alt="Фото" />
                            {editMode && (
                                <button className="delete-btn" onClick={() => handleDeletePhoto(photo.id)}>
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadPhotos;