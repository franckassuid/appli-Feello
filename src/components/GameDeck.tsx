import { useState } from 'react';
import { Card } from './Card';
import { questions } from '../data/questions';
import './GameDeck.css';

interface GameDeckProps {
    onHome: () => void;
}

export const GameDeck = ({ onHome }: GameDeckProps) => {
    const [index, setIndex] = useState(0);

    const questionIndex = ((index % questions.length) + questions.length) % questions.length;
    const currentQuestion = questions[questionIndex];

    const nextIndex = ((index + 1) % questions.length + questions.length) % questions.length;
    const nextQuestion = questions[nextIndex];

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        if (swipeDirection === 'left') {
            setIndex((prev) => prev - 1);
        } else {
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

            {/* Stack Implementation */}

            {/* Back Card (Next) */}
            <Card
                key={nextQuestion.id} // Ensure Key changes
                question={nextQuestion}
                isFront={false}
            />

            {/* Front Card (Current) */}
            <Card
                key={currentQuestion.id}
                question={currentQuestion}
                isFront={true}
                onSwipe={handleSwipe}
            />

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
