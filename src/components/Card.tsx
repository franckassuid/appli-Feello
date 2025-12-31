import { motion, type PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { type Question, themes } from '../data/questions';
import './Card.css';
import { useEffect } from 'react';

interface CardProps {
    question: Question;
    onSwipe?: (direction: 'left' | 'right') => void;
    isFront: boolean;
}

export const Card = ({ question, onSwipe, isFront }: CardProps) => {
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Rotation based on drag
    const rotate = useTransform(x, [-300, 300], [-15, 15]);
    // Opacity fades out only when dragged far
    const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);

    useEffect(() => {
        // When becoming front, ensure reset
        if (isFront) {
            controls.start({ x: 0, opacity: 1, scale: 1, rotate: 0 });
        }
    }, [isFront, controls]);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (!onSwipe) return;
        const threshold = 100;
        const velocity = info.velocity.x;

        if (info.offset.x > threshold || velocity > 500) {
            await controls.start({
                x: 800,
                rotate: 30,
                opacity: 0,
                transition: { duration: 0.3 }
            });
            onSwipe('right');
        } else if (info.offset.x < -threshold || velocity < -500) {
            await controls.start({
                x: -800,
                rotate: -30,
                opacity: 0,
                transition: { duration: 0.3 }
            });
            onSwipe('left');
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
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
                scale: isFront ? 1 : 0.95, // Back card slightly smaller
                y: isFront ? 0 : 10,       // Back card slighty lower
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            animate={controls}
            // Animate layout changes specifically for the stack effect
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
