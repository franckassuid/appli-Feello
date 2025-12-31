import { useState, useEffect } from 'react';
import { Card } from './Card';
import type { Question } from '../data/questions';
import './GameDeck.css';

interface GameDeckProps {
    onHome: () => void;
    questions: Question[];
}

export const GameDeck = ({ onHome, questions }: GameDeckProps) => {
    const [index, setIndex] = useState(0);
    const [animatingCard, setAnimatingCard] = useState<Question | null>(null);
    const [animatingDirection, setAnimatingDirection] = useState<'left' | 'right' | null>(null);

    // Reset to first card when component mounts (when coming back to game)
    useEffect(() => {
        setIndex(0);
    }, []);

    const questionIndex = ((index % questions.length) + questions.length) % questions.length;
    const currentQuestion = questions[questionIndex];

    const nextIndex = ((index + 1) % questions.length + questions.length) % questions.length;
    const nextQuestion = questions[nextIndex];

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        // Store the current card as animating
        setAnimatingCard(currentQuestion);
        setAnimatingDirection(swipeDirection);

        // Change index after animation completes
        setTimeout(() => {
            if (swipeDirection === 'left') {
                setIndex((prev) => prev - 1);
            } else {
                setIndex((prev) => prev + 1);
            }
            // Clear animating card after a bit more delay to ensure smooth transition
            setTimeout(() => {
                setAnimatingCard(null);
                setAnimatingDirection(null);
            }, 100);
        }, 450);
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
                key={`back-${nextQuestion.id}`}
                question={nextQuestion}
                isFront={false}
            />

            {/* Animating Card (if any) */}
            {animatingCard && (
                <Card
                    key={`animating-${animatingCard.id}`}
                    question={animatingCard}
                    isFront={true}
                    onSwipe={() => { }} // No swipe during animation
                    forceAnimate={animatingDirection}
                />
            )}

            {/* Front Card (Current) - only show if not animating */}
            {!animatingCard && (
                <Card
                    key={`front-${currentQuestion.id}`}
                    question={currentQuestion}
                    isFront={true}
                    onSwipe={handleSwipe}
                />
            )}

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
