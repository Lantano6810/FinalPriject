import React from "react";
import "./Modal.css";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    children: React.ReactNode;
    onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay">
            <div className="custom-modal">
                <div className="custom-modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="custom-modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;