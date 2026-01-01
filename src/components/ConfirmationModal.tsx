import { motion, AnimatePresence } from 'framer-motion';
import './GameDeck.css'; // Re-using styles defined there for now

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }: ConfirmationModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="confirm-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    style={{ zIndex: 99999 }} // Force very high z-index
                >
                    <motion.div
                        className="confirm-modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>{title}</h3>
                        <p>{message}</p>
                        <div className="confirm-modal-actions">
                            <button
                                className="confirm-modal-btn cancel"
                                onClick={onCancel}
                            >
                                Annuler
                            </button>
                            <button
                                className="confirm-modal-btn confirm"
                                onClick={onConfirm}
                            >
                                Confirmer
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
