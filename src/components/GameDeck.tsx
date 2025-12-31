import { useState, useEffect } from 'react';
import { Card } from './Card';
import type { Question } from '../data/questions';
import './GameDeck.css';

interface GameDeckProps {
    questions: Question[];
}

export const GameDeck = ({ questions }: GameDeckProps) => {
    const [index, setIndex] = useState(0);

    // Reset to first card when component mounts (when coming back to game)
    useEffect(() => {
        setIndex(0);
    }, []);

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
                    onClick={() => window.location.reload()}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {/* Stack Implementation */}
            {/* Back Card (Next) */}
            <Card
                key={`back-${nextQuestion.id}`}
                question={nextQuestion}
                isFront={false}
            />

            {/* Front Card (Current) */}
            <Card
                key={`front-${currentQuestion.id}`}
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
