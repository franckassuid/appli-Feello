import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroBox.css';
import { FeelloButton } from './FeelloButton';

interface IntroBoxProps {
    onOpen: () => void;
}

const Model = () => {
    const { scene } = useGLTF('/boite_feeloo_v2.1.glb');
    const ref = useRef<THREE.Group>(null);

    const { size, viewport } = useThree();

    // Dynamic Scale Calculation matching CSS: min(505px, 65vh)
    const MAX_CARD_HEIGHT_PX = 505;
    const VH_FACTOR = 0.65;
    const PADDING_PX = 20;
    const MODEL_HEIGHT_FACTOR = 27;

    // Calculate height in pixels (replicating CSS logic)
    // Note: size.height is roughly window.innerHeight since canvas is full screen
    const cardHeightPx = Math.min(MAX_CARD_HEIGHT_PX, size.height * VH_FACTOR);

    // Convert to 3D units
    const pixelToThreeRatio = viewport.height / size.height;
    const targetHeightThree = (cardHeightPx + PADDING_PX) * pixelToThreeRatio;

    const targetScale = targetHeightThree / MODEL_HEIGHT_FACTOR;
    const idleScale = targetScale * 0.8;

    // Initial rotation (Opposite wide face) as requested
    const INITIAL_ROTATION_Y = Math.PI * 1.5 + 0.5;

    useFrame((state) => {
        if (ref.current) {
            // Constant Idle Hover
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
            ref.current.position.x = 0;
            ref.current.position.z = 0;
            ref.current.rotation.y = INITIAL_ROTATION_Y + Math.sin(state.clock.elapsedTime * 0.2) * 0.1; // Slow rotation sway
            ref.current.rotation.x = 0;
            ref.current.rotation.z = 0;

            // Ensure scale is correct
            ref.current.scale.setScalar(idleScale);
        }
    });

    // useEffect for reset is removed as the model is always idle now

    return (
        <primitive
            object={scene}
            ref={ref}
            // scale managed by logic
            rotation={[0, INITIAL_ROTATION_Y, 0]}
            onPointerOver={() => (document.body.style.cursor = 'grab')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
        />
    );
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
        setIsOpen(true);
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
                    <ambientLight intensity={4.5} />
                    <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={3.0} />
                    <pointLight position={[-10, 0, -10]} intensity={3.0} />

                    <Suspense fallback={null}>
                        <Model />
                        <Environment preset="city" background={false} />
                        <ContactShadows position={[0, -.8, 0]} opacity={1} scale={10} blur={2.5} far={10} color="#000000" />
                        <SceneController isOpen={isOpen} />
                    </Suspense>
                </Canvas>
            </div>

            {!isOpen && (
                <>
                    {/* "L'appli" button positioned on logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        style={{
                            position: 'absolute',
                            top: '6vh',
                            left: '58%',
                            zIndex: 11,
                            transform: 'rotate(15deg)',
                        }}
                    >
                        <FeelloButton
                            label="L'appli"
                            onClick={() => { }}
                            variant="primary"
                        />
                    </motion.div>

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
                </>
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
