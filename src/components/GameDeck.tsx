import { useState, useEffect, useRef } from 'react';
import { Card, type CardHandle } from './Card';
import { type Question, type ThemeColor, themes } from '../data/questions';
import { AnimatePresence, motion } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { FeelloButton } from './FeelloButton';
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

const SEEN_STORAGE_KEY = 'feello_seen_ids';

export const GameDeck = ({ questions }: GameDeckProps) => {
    // 1. Persistent State: Seen Questions
    const [seenIds, setSeenIds] = useState<Set<string>>(() => {
        const stored = localStorage.getItem(SEEN_STORAGE_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    });

    // 2. Menu State
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState<ThemeColor[]>(Object.keys(themes) as ThemeColor[]);

    // 3. Deck State (Linear Shuffled List)
    const [deck, setDeck] = useState<Question[]>([]);
    const [index, setIndex] = useState(0);
    const [backCardType, setBackCardType] = useState<'next' | 'prev'>('next');
    const cardRef = useRef<CardHandle>(null);

    // 4. Modal & Animation State
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; onConfirm: () => void } | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);

    // --- Helpers ---

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    // --- Effects ---

    // Initialize/Reset Deck when filters or source questions change heavily
    useEffect(() => {
        const unseen = questions.filter(q => !seenIds.has(String(q.id)));
        const filtered = unseen.filter(q => selectedThemes.includes(q.theme));
        setDeck(shuffleArray(filtered));
        setIndex(0);
        setBackCardType('next');
    }, [questions, seenIds.size, selectedThemes.length]);

    // --- Handlers ---

    const toggleTheme = (theme: ThemeColor) => {
        setSelectedThemes(prev => {
            if (prev.includes(theme) && prev.length === 1) return prev;
            return prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme];
        });
    };

    const handleResetDeck = () => {
        setConfirmModal({
            show: true,
            onConfirm: () => {
                localStorage.removeItem(SEEN_STORAGE_KEY);
                setSeenIds(new Set());
                setIndex(0);
                setMenuOpen(false);
                setConfirmModal(null);
            }
        });
    };

    const markAsSeen = (id: string) => {
        const currentSeen = new Set(JSON.parse(localStorage.getItem(SEEN_STORAGE_KEY) || '[]'));
        currentSeen.add(id);
        localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(currentSeen)));
    };

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        if (swipeDirection === 'left') {
            if (index > 0) {
                setIndex(prev => prev - 1);
            }
        } else {
            // Right Swipe (Next)
            if (currentQuestion) {
                markAsSeen(String(currentQuestion.id));
            }
            setIndex(prev => prev + 1);
            setBackCardType('next');
        }
    };

    const handleDragDir = (dir: 'left' | 'right' | null) => {
        if (dir === 'left') setBackCardType('prev');
        else if (dir === 'right') setBackCardType('next');
    };

    const handleButtonSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        setBackCardType(direction === 'left' ? 'prev' : 'next');
        if (cardRef.current) cardRef.current.swipe(direction);
    };

    const handleShuffleRemaining = () => {
        if (index >= deck.length || isShuffling) return;

        setIsShuffling(true);

        setTimeout(() => {
            const past = deck.slice(0, index); // Keep history
            const remaining = deck.slice(index); // Current + Future
            const shuffledRemaining = shuffleArray(remaining);

            setDeck([...past, ...shuffledRemaining]);
            setIsShuffling(false);
        }, 500); // Match CSS animation duration
    };

    // --- Derived State ---

    const currentQuestion = deck[index];
    const nextQuestion = deck[index + 1];
    const prevQuestion = index > 0 ? deck[index - 1] : undefined;
    const backQuestion = backCardType === 'prev' ? prevQuestion : nextQuestion;

    const isFinished = index >= deck.length;
    const isEmpty = deck.length === 0;

    // Cards Remaining Calculation
    const remainingCards = Math.max(0, deck.length - (index + 1));

    // --- Render: End Screen (Empty or Finished) ---

    if (isEmpty || isFinished) {
        return (
            <div className="game-deck">
                <div className="end-game-screen">
                    <h2 className="end-game-title">Vous avez vu toutes les questions !</h2>

                    <div className="end-game-actions">
                        <FeelloButton
                            label="Recommencer"
                            onClick={handleResetDeck}
                            variant="primary"
                        />
                        {!isEmpty && (
                            <FeelloButton
                                label="Retour"
                                onClick={() => setIndex(prev => Math.max(0, prev - 1))}
                                variant="secondary"
                            />
                        )}
                    </div>
                </div>

                {/* Burger Menu Button (Access) */}
                <button className="menu-burger-btn" onClick={() => setMenuOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
                        <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                        <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
                    </svg>
                </button>

                {/* Reuse Menu Overlay */}
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
                                                    <div className="filter-checkbox">{isActive && "✓"}</div>
                                                    <span className="filter-label">{THEME_LABELS[themeKey]}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button className="refresh-btn" onClick={handleResetDeck}>
                                    Rafraîchir le paquet (Reset)
                                </button>

                                <div className="menu-footer">
                                    <a href="https://www.instagram.com/feello_jeu/" target="_blank" rel="noopener noreferrer" className="social-link"><img src="/instagram-icon.png" alt="Insta" /></a>
                                    <a href="https://www.tiktok.com/@feello_jeu" target="_blank" rel="noopener noreferrer" className="social-link"><img src="/tiktok-icon.png" alt="TikTok" /></a>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ConfirmationModal
                    isOpen={!!(confirmModal && confirmModal.show)}
                    title="Réinitialiser le jeu ?"
                    message="Voulez-vous vraiment remettre le jeu à zéro et revoir toutes les questions déjà passées ?"
                    onConfirm={confirmModal?.onConfirm || (() => { })}
                    onCancel={() => setConfirmModal(null)}
                />
            </div>
        );
    }

    // --- Render: Main Game ---

    const stackDepth = Math.min(Math.ceil(remainingCards / 3), 16); // Up to 16 layers diverse
    const stackLayers = Array.from({ length: stackDepth }).map((_, i) => {
        // Denser packing, smaller offsets
        const rotation = Math.sin(i * 1324) * 2; // -2 to 2 degrees
        const xOffset = Math.cos(i * 543) * 2; // Varying left/right slightly
        const yOffset = i * 0.8; // Progressive thickness downwards

        // Cycle colors from SELECTED themes only
        const activeThemeColors = selectedThemes.map(key => themes[key]);
        const color = activeThemeColors.length > 0
            ? activeThemeColors[i % activeThemeColors.length]
            : Object.values(themes)[i % Object.values(themes).length]; // Fallback if somehow empty but deck not empty

        return {
            rotation,
            x: xOffset,
            y: yOffset,
            color
        };
    });

    return (
        <div className="game-deck">
            <div className="top-bar">
                <img src="/logo.png" alt="Feello" className="main-logo" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }} />
            </div>

            <button className="menu-burger-btn" onClick={() => setMenuOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
                    <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                    <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
                </svg>
            </button>

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
                                                <div className="filter-checkbox">{isActive && "✓"}</div>
                                                <span className="filter-label">{THEME_LABELS[themeKey]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button className="refresh-btn" onClick={handleResetDeck}>
                                Rafraîchir le paquet (Reset)
                            </button>

                            <div className="menu-footer">
                                <a href="https://www.instagram.com/feello_jeu/" target="_blank" rel="noopener noreferrer" className="social-link"><img src="/instagram-icon.png" alt="Insta" /></a>
                                <a href="https://www.tiktok.com/@feello_jeu" target="_blank" rel="noopener noreferrer" className="social-link"><img src="/tiktok-icon.png" alt="TikTok" /></a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stack */}
            <div className={`cards-stack ${isShuffling ? 'shuffling' : ''}`}>
                {/* Visual Depth: Dense Stack layers behind */}
                {/* We reverse to paint the furthest first.
                    We render background as the THEME COLOR to mimic the card edge/back.
                */}
                {stackLayers.reverse().map((layer, i) => (
                    <div
                        key={`stack-layer-${i}`}
                        className="dummy-card-layer"
                        style={{
                            transform: `rotate(${layer.rotation}deg) translate(${layer.x}px, ${layer.y}px)`,
                            zIndex: -100 + i,
                            background: layer.color, // Full color background
                            boxShadow: '0 0.5px 1px rgba(0,0,0,0.15)', // Very subtle shadow for separation
                        }}
                    />
                ))}

                {backQuestion && (
                    <Card
                        key={`back-${backCardType}-${backQuestion.id}`}
                        question={backQuestion}
                        isFront={false}
                    />
                )}

                {currentQuestion && (
                    <Card
                        ref={cardRef}
                        key={`front-${currentQuestion.id}`}
                        question={currentQuestion}
                        isFront={true}
                        onSwipe={handleSwipe}
                        onDragDirChange={handleDragDir}
                        isFirstCard={index === 0}
                    />
                )}
            </div>

            {/* Navigation Bar */}
            <div className="deck-instruction">
                <button
                    className="arrow-btn"
                    onClick={() => handleButtonSwipe('left')}
                    disabled={index === 0}
                    style={{ opacity: index === 0 ? 0.3 : 1 }}
                >
                    ← Précédent
                </button>

                <button
                    className={`shuffle-btn ${isShuffling ? 'spinning' : ''}`}
                    onClick={handleShuffleRemaining}
                    title="Mélanger"
                >
                    <svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
                </button>

                <button
                    className="arrow-btn"
                    onClick={() => handleButtonSwipe('right')}
                >
                    Suivant →
                </button>
            </div>

            <ConfirmationModal
                isOpen={!!(confirmModal && confirmModal.show)}
                title="Réinitialiser le jeu ?"
                message="Voulez-vous vraiment remettre le jeu à zéro et revoir toutes les questions déjà passées ?"
                onConfirm={confirmModal?.onConfirm || (() => { })}
                onCancel={() => setConfirmModal(null)}
            />
        </div>
    );
};
