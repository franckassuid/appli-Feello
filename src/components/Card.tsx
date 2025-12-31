import { motion, type PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { type Question, themes } from '../data/questions';
import './Card.css';
import { useEffect, useState } from 'react';

interface CardProps {
    question: Question;
    onSwipe?: (direction: 'left' | 'right') => void;
    isFront: boolean;
}

export const Card = ({ question, onSwipe, isFront }: CardProps) => {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const rotate = useTransform(x, [-300, 300], [-15, 15]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        // When becoming front, ensure reset
        if (isFront) {
            controls.start({ x: 0, opacity: 1, scale: 1, rotate: 0 });
        }
    }, [isFront, controls]);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        setIsDragging(false);
        if (!onSwipe) return;
        const threshold = 100;
        const velocity = info.velocity.x;
        const screenWidth = window.innerWidth;

        // Swipe right
        if (info.offset.x > threshold || velocity > 500) {
            await controls.start({
                x: screenWidth,
                rotate: 45,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.4 }
            });
            onSwipe('right');
        }
        // Swipe left
        else if (info.offset.x < -threshold || velocity < -500) {
            await controls.start({
                x: -screenWidth,
                rotate: -45,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.4 }
            });
            onSwipe('left');
        }
        // Return to center
        else {
            controls.start({
                x: 0,
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: { type: "spring", stiffness: 500, damping: 30 }
            });
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // Don't handle click if we just finished dragging
        if (isDragging || !onSwipe || !isFront) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const third = rect.width / 3;

        if (clickX > 2 * third) {
            // Clicked on right third - swipe right with animation
            controls.start({
                x: window.innerWidth,
                rotate: 45,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.4 }
            }).then(() => onSwipe('right'));
        } else if (clickX < third) {
            // Clicked on left third - swipe left with animation
            controls.start({
                x: -window.innerWidth,
                rotate: -45,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.4 }
            }).then(() => onSwipe('left'));
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
                scale: isFront ? 1 : 0.95,
                y: isFront ? 0 : 10,
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            animate={controls}
            transition={{ layout: { duration: 0.3 } }}
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
                    {/* Logo removed */}
                    <span className="card-symbol">{question.category}</span>
                </div>
            </div>
        </motion.div>
    );
};
