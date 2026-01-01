import { useState, useEffect, useRef } from 'react';
import { Card, type CardHandle } from './Card';
import type { Question } from '../data/questions';
import './GameDeck.css';

interface GameDeckProps {
    questions: Question[];
}

export const GameDeck = ({ questions }: GameDeckProps) => {
    const [index, setIndex] = useState(0);
    const [backCardType, setBackCardType] = useState<'next' | 'prev'>('next');
    const cardRef = useRef<CardHandle>(null);

    // Reset to first card when component mounts (when coming back to game)
    useEffect(() => {
        setIndex(0);
        setBackCardType('next');
    }, []);

    const questionIndex = ((index % questions.length) + questions.length) % questions.length;
    const currentQuestion = questions[questionIndex];

    const nextIndex = ((index + 1) % questions.length + questions.length) % questions.length;
    const nextQuestion = questions[nextIndex];

    const prevIndex = ((index - 1) % questions.length + questions.length) % questions.length;
    const prevQuestion = questions[prevIndex];

    const handleSwipe = (swipeDirection: 'left' | 'right') => {
        if (swipeDirection === 'left') {
            setIndex((prev) => prev - 1);
            setBackCardType('prev'); // Prepare for next prev action if needed? Or reset?
            // Actually, after swipe, the new card is Front. The NEW Back card is by default 'next' usually.
            // But let's reset to 'next' shortly after? Or keep it?
            // If I swiped Left (Prev), the new Front is Card N-1. The Back should probably be N-2 (Prev) or N (Next)?
            // Default "next" is safer.
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

    // Determine which card is shown in the back based on drag direction
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

            {/* Stack Implementation */}
            <div className="cards-stack">
                {/* Back Card (Dynamic: Prev or Next) */}
                <Card
                    key={`back-${backCardType}-${backQuestion.id}`}
                    question={backQuestion}
                    isFront={false}
                />

                {/* Front Card (Current) */}
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
