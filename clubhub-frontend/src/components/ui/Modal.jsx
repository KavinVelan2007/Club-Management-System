import { useEffect } from "react";
import { X } from "lucide-react";
import GlassSurface from "../GlassSurface/GlassSurface";
import "./forms.css";

function Modal({ open, title, subtitle, onClose, children, width = 540 }) {
    useEffect(() => {
        if (!open) return undefined;
        const handleKey = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-panel" style={{ maxWidth: `${width}px` }} role="dialog" aria-modal="true" aria-label={title}>
                <GlassSurface width="100%" borderRadius={22} backgroundOpacity={0.12} blur={14} brightness={16}>
                    <div className="modal-content">
                        <header className="modal-header">
                            <div>
                                <h2>{title}</h2>
                                {subtitle && <p>{subtitle}</p>}
                            </div>
                            <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
                                <X size={18} />
                            </button>
                        </header>
                        {children}
                    </div>
                </GlassSurface>
            </div>
        </div>
    );
}

export default Modal;