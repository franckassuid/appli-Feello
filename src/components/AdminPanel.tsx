import { useState, useEffect } from 'react';
import { themes } from '../data/questions';
import type { Question, ThemeColor } from '../data/questions';
import { FeelloButton } from './FeelloButton';
import './AdminPanel.css';

interface AdminPanelProps {
    questions: Question[];
    onAddQuestion: (q: Omit<Question, 'id'>) => Promise<void>;
    onUpdateQuestion: (id: string, q: Partial<Question>) => Promise<void>;
    onDeleteQuestion: (id: string) => Promise<void>;
    onBack: () => void;
}

const THEME_DEFAULTS: Record<ThemeColor, { category: string, tagline: string }> = {
    'orange': { category: 'A', tagline: 'aspiration & préférence' },
    'black': { category: 'E', tagline: 'existence & philosophie' },
    'olive': { category: 'I', tagline: 'identité & introspection' },
    'pink': { category: 'R', tagline: 'relation & interaction' },
    'blue': { category: 'R', tagline: 'réflexion & expérience' }
};

interface ConfirmationState {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
}

export const AdminPanel = ({ questions, onAddQuestion, onUpdateQuestion, onDeleteQuestion, onBack }: AdminPanelProps) => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [questionForm, setQuestionForm] = useState({
        theme: 'orange' as ThemeColor,
        text: ''
    });

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<ConfirmationState>({
        show: false,
        title: '',
        message: '',
        onConfirm: async () => { }
    });

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const toggleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const displayQuestions = [...questions].sort((a, b) => {
        // Handle Firestore Timestamp or missing date (legacy = 0)
        // Check for .seconds (Firestore) or .toMillis()
        const getTime = (q: Question) => {
            if (!q.createdAt) return 0;
            // It might be a Firestore Timestamp object with seconds
            if (typeof q.createdAt.seconds === 'number') return q.createdAt.seconds;
            // Or maybe a Date object (if converted previously)
            if (q.createdAt instanceof Date) return q.createdAt.getTime() / 1000;
            return 0;
        };

        const timeA = getTime(a);
        const timeB = getTime(b);

        if (timeA === timeB) {
            // Fallback for legacy items: keep original relative order roughly, 
            // or compare IDs to be deterministic
            // Assuming string IDs.
            return String(a.id).localeCompare(String(b.id)) * (sortOrder === 'asc' ? 1 : -1);
        }

        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mot de passe incorrect');
        }
    };

    const handleEditClick = (q: Question) => {
        setEditingId(String(q.id));
        setQuestionForm({
            theme: q.theme,
            text: q.text
        });
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setQuestionForm({ theme: 'orange', text: '' });
    };

    // Generic Modal Close
    const closeConfirm = () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
    };

    // Generic Action Wrapper
    const requestConfirmation = (title: string, message: string, action: () => Promise<void>) => {
        setConfirmModal({
            show: true,
            title,
            message,
            onConfirm: async () => {
                await action();
                closeConfirm();
            }
        });
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        requestConfirmation(
            "Supprimer la question ?",
            "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette question définitivement ?",
            async () => {
                await onDeleteQuestion(id);
                if (editingId === id) handleCancelEdit();
            }
        );
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!questionForm.text) return;

        const defaults = THEME_DEFAULTS[questionForm.theme];
        const payload = {
            theme: questionForm.theme,
            text: questionForm.text,
            category: defaults.category,
            tagline: defaults.tagline
        };

        const title = editingId ? "Modifier la question ?" : "Ajouter cette question ?";
        const message = editingId
            ? "Le contenu de la question sera mis à jour pour tous les utilisateurs."
            : "La question sera immédiatement ajoutée à la base de données.";

        requestConfirmation(title, message, async () => {
            if (editingId) {
                await onUpdateQuestion(editingId, payload);
                handleCancelEdit();
            } else {
                await onAddQuestion(payload);
                setQuestionForm(prev => ({ ...prev, text: '' }));
            }
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-panel login-mode">
                <button onClick={onBack} className="back-btn absolute-back">← Retour</button>
                <div className="login-container">
                    <img src="/logo.png" alt="Feello" className="admin-logo" />
                    <h2>Accès Admin</h2>
                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button type="submit">Entrer</button>
                        {error && <p className="error-msg">{error}</p>}
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <div className="admin-branding">
                    <img src="/logo.png" alt="Feello" className="admin-logo-img" />
                    <span className="admin-badge">ADMIN</span>
                </div>
                <div className="header-actions">
                    <span className="badge">{questions.length} questions</span>
                </div>
            </header>

            <div className="admin-content">
                <div className="admin-column left-main">
                    <div className="admin-card create-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Modifier la Question' : 'Nouvelle Question'}</h3>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} style={{ background: 'transparent', border: '1px solid #aaa', color: '#aaa', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                                    Annuler
                                </button>
                            )}
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
                            <div className="form-group">
                                <label>Thème</label>
                                <div className="theme-grid">
                                    {Object.entries(themes).map(([key, color]) => {
                                        const themeKey = key as ThemeColor;
                                        const isSelected = questionForm.theme === themeKey;
                                        const label = THEME_DEFAULTS[themeKey].tagline;

                                        return (
                                            <div
                                                key={key}
                                                className={`theme-card-option ${isSelected ? 'selected' : ''}`}
                                                onClick={() => setQuestionForm({ ...questionForm, theme: themeKey })}
                                                style={{
                                                    '--theme-color': color,
                                                    borderLeft: isSelected ? `6px solid ${color}` : `2px solid ${color}`
                                                } as any}
                                            >
                                                <span className="theme-name">
                                                    {label}
                                                </span>
                                                {isSelected && <div className="check-mark">✓</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Question</label>
                                <textarea
                                    placeholder="Écrivez votre question ici..."
                                    value={questionForm.text}
                                    onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="submit-wrapper">
                                <FeelloButton
                                    label={editingId ? "Mettre à jour" : "Ajouter la question"}
                                    onClick={() => handleSubmit()}
                                    type="button"
                                    variant="primary"
                                    showArrow={false}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="admin-column right-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Liste des questions</h3>
                        <button
                            onClick={toggleSort}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#ddd',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            title={sortOrder === 'desc' ? "Afficher les plus anciennes en premier" : "Afficher les plus récentes en premier"}
                        >
                            <span>{sortOrder === 'desc' ? 'Plus récentes' : 'Plus anciennes'}</span>
                            <span style={{ fontSize: '1.2rem' }}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </button>
                    </div>
                    <div className="questions-list">
                        {displayQuestions.map(q => (
                            <div key={q.id} className={`question-item ${editingId === String(q.id) ? 'editing-item' : ''}`} style={{ borderLeft: `4px solid ${themes[q.theme]}` }}>
                                <div className="q-content">
                                    <div className="q-meta">
                                        <span className="q-cat" style={{ color: themes[q.theme] }}>{q.category}</span>
                                        <span className="q-tag">{q.tagline}</span>
                                    </div>
                                    <p className="q-text">{q.text}</p>
                                </div>
                                <div className="q-actions">
                                    <button
                                        type="button"
                                        className="action-btn edit"
                                        onClick={() => handleEditClick(q)}
                                        title="Modifier"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        type="button"
                                        className="action-btn delete"
                                        onClick={(e) => handleDeleteClick(e, String(q.id))}
                                        title="Supprimer"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h3>{confirmModal.title}</h3>
                        <p>{confirmModal.message}</p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={closeConfirm}>
                                Annuler
                            </button>
                            <button className="modal-btn confirm" onClick={confirmModal.onConfirm}>
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
