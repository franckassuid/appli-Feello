import { useState, useEffect, useRef } from 'react';
import { Card, type CardHandle } from './Card';
import { type Question, type ThemeColor, themes } from '../data/questions';
import { AnimatePresence, motion } from 'framer-motion';
import './GameDeck.css';

interface GameDeckProps {
    questions: Question[];
}

const THEME_LABELS: Record<ThemeColor, string> = {
    'orange': 'Aspiration & Préférence',
    'black': 'Existence & Philosophie',
    'olive': 'Identité & Introspection',
    'pink': 'Relation & Interaction',
    'blue': 'Réflexion & Expérience'
};

export const GameDeck = ({ questions }: GameDeckProps) => {
    const [index, setIndex] = useState(0);
    const [backCardType, setBackCardType] = useState<'next' | 'prev'>('next');
    const cardRef = useRef<CardHandle>(null);

    // Menu State
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState<ThemeColor[]>(Object.keys(themes) as ThemeColor[]);

    // Reset to first card when component mounts or filters change
    useEffect(() => {
        setIndex(0);
        setBackCardType('next');
    }, [selectedThemes.length]); // Reset when filter count changes (simple trigger)

    const toggleTheme = (theme: ThemeColor) => {
        setSelectedThemes(prev => {
            // Prevent deselecting the last theme (to avoid empty deck)
            if (prev.includes(theme) && prev.length === 1) {
                return prev;
            }
            if (prev.includes(theme)) {
                return prev.filter(t => t !== theme);
            }
            return [...prev, theme];
        });
    };

    // Filter questions
    const activeQuestions = questions.filter(q => selectedThemes.includes(q.theme));
    // Safety fallback (should rarely be hit if logic above works)
    const displayQuestions = activeQuestions.length > 0 ? activeQuestions : questions;

    const questionIndex = ((index % displayQuestions.length) + displayQuestions.length) % displayQuestions.length;
    const currentQuestion = displayQuestions[questionIndex];

    const nextIndex = ((index + 1) % displayQuestions.length + displayQuestions.length) % displayQuestions.length;
    const nextQuestion = displayQuestions[nextIndex];

    const prevIndex = ((index - 1) % displayQuestions.length + displayQuestions.length) % displayQuestions.length;
    const prevQuestion = displayQuestions[prevIndex];

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        if (swipeDirection === 'left') {
            setIndex((prev) => prev - 1);
            // setBackCardType('prev'); // This line was commented out in the instruction, keeping it that way.
        } else {
            setIndex((prev) => prev + 1);
            setBackCardType('next');
        }
    };

    const handleDragDir = (dir: 'left' | 'right' | null) => {
        if (dir === 'left') {
            setBackCardType('prev');
        } else if (dir === 'right') {
            setBackCardType('next');
        }
    };

    const handleButtonSwipe = (direction: 'left' | 'right') => {
        // Pre-set back card type before animating so the right card is revealed
        setBackCardType(direction === 'left' ? 'prev' : 'next');
        if (cardRef.current) {
            cardRef.current.swipe(direction);
        }
    };

    const backQuestion = backCardType === 'prev' ? prevQuestion : nextQuestion;

    return (
        <div className="game-deck">
            <div className="top-bar">
                <img
                    src="/logo.png"
                    alt="Feello"
                    className="main-logo"
                    onClick={() => window.location.reload()}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {/* Burger Menu Button */}
            <button className="menu-burger-btn" onClick={() => setMenuOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
                    <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                    <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
                </svg>
            </button>

            {/* Menu Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="game-menu-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMenuOpen(false)}
                    >
                        <motion.div
                            className="game-menu-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        >
                            <button className="close-menu-btn" onClick={() => setMenuOpen(false)}>✕</button>

                            <div className="filter-section">
                                <h3>Filtres par thèmes</h3>
                                <div className="filter-list">
                                    {Object.entries(themes).map(([key, color]) => {
                                        const themeKey = key as ThemeColor;
                                        const isActive = selectedThemes.includes(themeKey);
                                        return (
                                            <div
                                                key={key}
                                                className={`filter-item ${isActive ? 'active' : ''}`}
                                                style={{ '--theme-color': color } as any}
                                                onClick={() => toggleTheme(themeKey)}
                                            >
                                                <div className="filter-checkbox">
                                                    {isActive && "✓"}
                                                </div>
                                                <span className="filter-label">
                                                    {THEME_LABELS[themeKey]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button className="refresh-btn">
                                Rafraîchir le paquet
                            </button>

                            <div className="menu-footer">
                                <a href="https://www.instagram.com/feello_jeu/" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                                    <img src="/instagram-icon.png" alt="Instagram" />
                                </a>
                                <a href="https://www.tiktok.com/@feello_jeu" target="_blank" rel="noopener noreferrer" className="social-link" title="TikTok">
                                    <img src="/tiktok-icon.png" alt="TikTok" />
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stack Implementation */}
            <div className="cards-stack">
                <Card
                    key={`back-${backCardType}-${backQuestion.id}`}
                    question={backQuestion}
                    isFront={false}
                />

                <Card
                    ref={cardRef}
                    key={`front-${currentQuestion.id}`}
                    question={currentQuestion}
                    isFront={true}
                    onSwipe={handleSwipe}
                    onDragDirChange={handleDragDir}
                />
            </div>

            <div className="deck-instruction">
                <button
                    className="arrow-btn"
                    onClick={() => handleButtonSwipe('left')}
                >
                    ← Précédent
                </button>
                <button
                    className="arrow-btn"
                    onClick={() => handleButtonSwipe('right')}
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
};
