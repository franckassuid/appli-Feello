import { useState } from 'react';
import { themes } from '../data/questions';
import type { Question, ThemeColor } from '../data/questions';
import './AdminPanel.css';

interface AdminPanelProps {
    questions: Question[];
    onAddQuestion: (q: Omit<Question, 'id'>) => void;
    onBack: () => void;
}

export const AdminPanel = ({ questions, onAddQuestion, onBack }: AdminPanelProps) => {
    const [newQuestion, setNewQuestion] = useState({
        theme: 'orange' as ThemeColor,
        category: '',
        tagline: '',
        text: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.text || !newQuestion.category) return;
        onAddQuestion(newQuestion);
        setNewQuestion({ ...newQuestion, text: '', tagline: '' }); // Keep letter/theme for speed? Or reset. Resetting.
        alert('Question ajoutée !');
    };

    return (
        <div className="admin-panel">
            <button onClick={onBack} className="back-btn">← Retour</button>
            <h2>Administration</h2>

            <div className="admin-section">
                <h3>Ajouter une question</h3>
                <form onSubmit={handleSubmit}>
                    <label>Thème</label>
                    <select
                        value={newQuestion.theme}
                        onChange={e => setNewQuestion({ ...newQuestion, theme: e.target.value as ThemeColor })}
                    >
                        {Object.keys(themes).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <input
                        placeholder="Lettre (ex: A, R...)"
                        value={newQuestion.category}
                        onChange={e => setNewQuestion({ ...newQuestion, category: e.target.value.toUpperCase() })}
                        maxLength={1}
                    />

                    <input
                        placeholder="Tagline (ex: aspiration & préférence)"
                        value={newQuestion.tagline}
                        onChange={e => setNewQuestion({ ...newQuestion, tagline: e.target.value })}
                    />

                    <textarea
                        placeholder="Texte de la question..."
                        value={newQuestion.text}
                        onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                        rows={3}
                    />

                    <button type="submit">Ajouter la question</button>
                </form>
            </div>

            <div className="admin-section">
                <h3>Questions existantes ({questions.length})</h3>
                <div className="questions-list">
                    {questions.slice().reverse().map(q => ( // Show newest first
                        <div key={q.id} className="question-item" style={{ borderLeft: `5px solid ${themes[q.theme]}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{q.category}</span>
                                <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>{q.tagline}</span>
                            </div>
                            <p style={{ margin: 0 }}>{q.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="admin-section">
                <h3>JSON complet (Sauvegarde)</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>
                    Copiez ce contenu dans <code>src/data/questions.ts</code> pour le rendre permanent pour tous les utilisateurs.
                </p>
                <textarea
                    readOnly
                    value={JSON.stringify(questions, null, 4)}
                    style={{ width: '100%', height: '150px', background: '#222', color: '#ccc', fontFamily: 'monospace' }}
                />
            </div>
        </div>
    );
};
