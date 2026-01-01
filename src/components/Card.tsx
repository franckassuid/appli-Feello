import { motion, type PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { type Question, themes } from '../data/questions';
import './Card.css';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

export interface CardHandle {
    swipe: (direction: 'left' | 'right') => Promise<void>;
}

interface CardProps {
    question: Question;
    onSwipe?: (direction: 'left' | 'right') => void;
    onDragDirChange?: (dir: 'left' | 'right' | null) => void;
    isFront: boolean;
    isFirstCard?: boolean;
}

export const Card = forwardRef<CardHandle, CardProps>(({ question, onSwipe, onDragDirChange, isFront, isFirstCard = false }, ref) => {
    const x = useMotionValue(0);
    // ... existing hooks

    const handleDrag = (_: any, info: PanInfo) => {
        if (!onDragDirChange) return;
        // Detect direction based on drag offset
        if (info.offset.x > 5) {
            onDragDirChange('right');
        } else if (info.offset.x < -5) {
            onDragDirChange('left');
        } else {
            onDragDirChange(null);
        }
    };

    // ... existing useEffect
    const controls = useAnimation();
    const rotate = useTransform(x, [-300, 300], [-15, 15]);

    useImperativeHandle(ref, () => ({
        swipe: async (direction: 'left' | 'right') => {
            const screenWidth = window.innerWidth;
            const xTarget = direction === 'right' ? screenWidth + 200 : -screenWidth - 200;
            const rotTarget = direction === 'right' ? 45 : -45;

            await controls.start({
                x: xTarget,
                rotate: rotTarget,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.3 }
            });
            if (onSwipe) onSwipe(direction);
        }
    }));

    useEffect(() => {
        if (isFront) {
            controls.start({
                x: 0,
                opacity: 1,
                scale: 1,
                rotate: 0,
                y: 0,
                zIndex: 2,
                transition: { duration: 0.3 }
            });
        } else {
            // Back card position - messy stack effect
            controls.start({
                x: 0,
                opacity: 1,
                scale: 0.94,
                rotate: -3, // Slightly tilted
                y: 12,      // Peeking from bottom
                zIndex: 1,
                transition: { duration: 0.4, delay: 0.1 }
            });
        }
    }, [isFront, controls]);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (!onSwipe) return;
        const threshold = 100;
        const velocity = info.velocity.x;
        const screenWidth = window.innerWidth;

        if (info.offset.x > threshold || velocity > 500) {
            await controls.start({
                x: screenWidth + 200,
                rotate: 45,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.3 }
            });
            onSwipe('right');
        }
        else if ((info.offset.x < -threshold || velocity < -500) && !isFirstCard) {
            await controls.start({
                x: -screenWidth - 200,
                rotate: -45,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.3 }
            });
            onSwipe('left');
        }
        else {
            controls.start({
                x: 0,
                opacity: 1,
                scale: 1,
                rotate: 0,
                y: 0,
                transition: { type: "spring", stiffness: 500, damping: 30 }
            });
        }
    };

    const themeColor = themes[question.theme];

    return (
        <motion.div
            className="card-container"
            style={{
                x: isFront ? x : 0,
                rotate: isFront ? rotate : 0,
                zIndex: isFront ? 2 : 1,
                pointerEvents: isFront ? 'auto' : 'none',
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: isFirstCard ? 0 : 0.6, right: 0.6 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={controls}
            // Start at "Back" position if mounting as Front
            initial={isFront ? {
                scale: 0.95,
                y: 10,
                opacity: 1,
                x: 0,
                rotate: 0
            } : {
                // Back card initial
                scale: 0.95,
                y: 10,
                opacity: 0,
                x: 0,
                rotate: 0
            }}
            whileTap={isFront ? { scale: 0.98 } : {}}
        >
            <div
                className="card-content"
                style={{ backgroundColor: themeColor }}
            >
                <div className="card-header">
                    <span className="card-letter">{question.category}</span>
                    <div className="card-pill" style={{ color: themeColor }}>
                        {question.tagline}
                    </div>
                </div>

                <div className="card-body">
                    <p className="question-text">
                        {question.text}
                    </p>
                </div>

                <div className="card-footer">
                    <span className="card-symbol">{question.category}</span>
                </div>
            </div>
        </motion.div>
    );
});
