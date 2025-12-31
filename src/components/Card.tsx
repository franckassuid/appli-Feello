import { motion, type PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { type Question, themes } from '../data/questions';
import './Card.css';
import { useEffect } from 'react';

interface CardProps {
    question: Question;
    onSwipe: (direction: 'left' | 'right') => void;
    custom: number;
}

export const Card = ({ question, onSwipe, custom }: CardProps) => {
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Simpler, cleaner rotation and opacity
    const rotate = useTransform(x, [-300, 300], [-15, 15]);
    const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);

    useEffect(() => {
        // Reset position when question changes (new card)
        x.set(0);
        controls.start({
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        });
    }, [question, controls, x]);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const threshold = 100;
        const velocity = info.velocity.x;

        if (info.offset.x > threshold || velocity > 500) {
            // Swipe Right
            await controls.start({
                x: 500,
                opacity: 0,
                transition: { duration: 0.2 }
            });
            onSwipe('right');
        } else if (info.offset.x < -threshold || velocity < -500) {
            // Swipe Left
            await controls.start({
                x: -500,
                opacity: 0,
                transition: { duration: 0.2 }
            });
            onSwipe('left');
        } else {
            // Return to center
            controls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
        }
    };

    const themeColor = themes[question.theme];

    return (
        <motion.div
            className="card-container"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }} // Free drag but snap back
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}

        // Layout ID helps with smooth morphing if we had shared elements, 
        // but for stack cards we rely on entering animation
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
                    <img src="/logo.png" alt="Feello" className="card-logo" />
                    <span className="card-symbol" style={{ opacity: 0.2 }}>{question.category}</span>
                </div>
            </div>
        </motion.div>
    );
};
