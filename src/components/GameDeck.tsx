import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { questions } from '../data/questions';
import './GameDeck.css';

interface GameDeckProps {
    onHome: () => void;
}

export const GameDeck = ({ onHome }: GameDeckProps) => {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const questionIndex = ((index % questions.length) + questions.length) % questions.length;
    const currentQuestion = questions[questionIndex];

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        if (swipeDirection === 'left') {
            setDirection(-1);
            setIndex((prev) => prev - 1);
        } else {
            setDirection(1);
            setIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="game-deck">
            <div className="top-bar">
                <img
                    src="/logo.png"
                    alt="Feello"
                    className="main-logo"
                    onClick={onHome}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            <div className="cards-container">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <Card
                        key={index}
                        question={currentQuestion}
                        onSwipe={handleSwipe}
                    />
                </AnimatePresence>
            </div>

            <div className="deck-instruction">
                <button
                    className="arrow-btn"
                    onClick={() => handleSwipe('left')}
                >
                    ← Précédent
                </button>
                <button
                    className="arrow-btn"
                    onClick={() => handleSwipe('right')}
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
};
