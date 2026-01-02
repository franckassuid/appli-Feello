import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { useState, useRef, Suspense, useEffect } from 'react';
import { FeelloModel } from './FeelloModel';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroBox.css';
import { FeelloButton } from './FeelloButton';

interface IntroBoxProps {
    onOpen: () => void;
}

const ResponsiveModel = () => {
    const { viewport } = useThree();
    const MODEL_RAW_HEIGHT = 27;
    const MODEL_RAW_WIDTH = 18;
    const scaleY = (viewport.height * 0.95) / MODEL_RAW_HEIGHT;
    const scaleX = (viewport.width * 0.95) / MODEL_RAW_WIDTH;
    const targetScale = Math.min(scaleX, scaleY);

    return <FeelloModel scale={targetScale} />;
};

// Component to handle camera/control reset
const SceneController = ({ isOpen }: { isOpen: boolean }) => {
    const controlsRef = useRef<any>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (!isOpen && controlsRef.current) {
            controlsRef.current.reset();
            camera.position.set(0, 0, 4.5);
            camera.lookAt(0, 0, 0);
        }
    }, [isOpen, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            rotateSpeed={1}
            enableDamping={true}
            dampingFactor={0.05}
        />
    );
};

export const IntroBox = ({ onOpen }: IntroBoxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showRules, setShowRules] = useState(false);

    // Reset state when component mounts (when returning from game)
    useEffect(() => {
        setIsOpen(false);
    }, []);

    const handleStart = () => {
        onOpen();
    };



    return (
        <div className="scene-container">
            {/* Logo Overlay */}
            {!isOpen && (
                <motion.div
                    className="logo-container"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <img src="/logo.png" alt="Feello" className="intro-logo" />
                </motion.div>
            )}

            <div className="canvas-wrapper">
                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <ambientLight intensity={3} />
                    <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={3.0} />
                    <pointLight position={[-10, 0, -10]} intensity={1.0} />

                    <Suspense fallback={null}>
                        <ResponsiveModel />
                        {/* Environment removed due to unstable CDN causing infinite loading */}
                        <ContactShadows position={[0, -.8, 0]} opacity={1} scale={10} blur={2.5} far={10} color="#000000" />
                        <SceneController isOpen={isOpen} />
                    </Suspense>
                </Canvas>
            </div>

            {!isOpen && (
                <motion.div
                    className="intro-ui"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="button-group">
                        <FeelloButton
                            label="Règles du jeu"
                            onClick={() => setShowRules(true)}
                            variant="secondary"
                        />
                        <FeelloButton
                            label="Commencer"
                            onClick={handleStart}
                            variant="primary"
                        />
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {showRules && (
                    <motion.div
                        className="rules-modal"
                        onClick={() => setShowRules(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Close Button - Outside Card, Top Right of Screen */}
                        <button
                            className="close-btn"
                            onClick={() => setShowRules(false)}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)',
                                border: '2px solid rgba(255,255,255,0.5)',
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                zIndex: 101, // Above everything
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <motion.div
                            className="rules-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div className="rules-header">
                                <span className="rules-top-left">LE JEU</span>
                                {/* Logo instead of text */}
                                <img src="/logo.png" alt="Feello" style={{ height: '30px', width: 'auto' }} />
                            </div>

                            <div className="rules-pill">
                                comment ça marche ?
                            </div>

                            <h2 className="rules-title">
                                Feello encourage un dialogue spontané, authentique et <span className="underline">sans jugement</span>.
                            </h2>

                            <div className="rules-list">
                                <div className="rules-item">
                                    <span className="rule-number">1</span>
                                    <p>Choisis une question qui t’inspire ou pioche-en une autre.</p>
                                </div>
                                <div className="rules-item">
                                    <span className="rule-number">2</span>
                                    <p><strong>Suis ton intuition</strong> et partage la première idée qui te vient à l’esprit.</p>
                                </div>
                                <div className="rules-item">
                                    <span className="rule-number">3</span>
                                    <p>Interprète la question comme <strong>tu le souhaites</strong> et réponds-y en fonction de ta compréhension.</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
