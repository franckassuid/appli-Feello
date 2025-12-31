import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroBox.css';

interface IntroBoxProps {
    onOpen: () => void;
}

const Model = ({ isOpen }: { isOpen: boolean }) => {
    const { scene } = useGLTF('/boite_feeloo_v2.1.glb');
    const ref = useRef<THREE.Group>(null);
    const openTimeRef = useRef<number | null>(null);

    // Initial rotation (Opposite wide face) as requested
    const INITIAL_ROTATION_Y = Math.PI * 1.5 + 0.5;

    useFrame((state) => {
        if (ref.current) {
            if (!isOpen) {
                // Gentle idle hover
                ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
                ref.current.position.x = 0;
                ref.current.position.z = 0;
                ref.current.rotation.y = INITIAL_ROTATION_Y;
                ref.current.rotation.x = 0;
                ref.current.rotation.z = 0;

                openTimeRef.current = null;
            } else {
                // ANIMATION SEQUENCE
                if (openTimeRef.current === null) {
                    openTimeRef.current = state.clock.elapsedTime;
                }

                const elapsed = state.clock.elapsedTime - openTimeRef.current;

                // Phase 1: ROTATE TO FRONT & SCALE (0s to 1.0s)
                if (elapsed < 1.0) {
                    const t = elapsed / 1.0;
                    const ease = 1 - Math.pow(1 - t, 3);

                    // To Front
                    ref.current.rotation.y = THREE.MathUtils.lerp(INITIAL_ROTATION_Y, Math.PI, ease);

                    // To Center
                    ref.current.position.y = THREE.MathUtils.lerp(0, 0, ease);

                    // Scale Up
                    const targetScale = 0.085;
                    const currentScale = THREE.MathUtils.lerp(0.07, targetScale, ease);
                    ref.current.scale.setScalar(currentScale);
                }
                // Phase 2: HOLD (1.0s to 1.5s) - Stay perfectly still
                else if (elapsed < 1.5) {
                    ref.current.rotation.y = Math.PI;
                    ref.current.position.y = 0;
                    ref.current.scale.setScalar(0.085);
                }
                // Phase 3: SLOW DROP (1.5s onwards)
                else {
                    const dropElapsed = elapsed - 1.5;
                    // Slower drop (gravity factor 2)
                    ref.current.position.y = 0 - (dropElapsed * dropElapsed * 2);

                    // Maintain orientation
                    ref.current.rotation.y = Math.PI;
                    ref.current.scale.setScalar(0.085);
                }
            }
        }
    });

    useEffect(() => {
        if (!isOpen && ref.current) {
            ref.current.position.set(0, 0, 0);
            ref.current.rotation.set(0, INITIAL_ROTATION_Y, 0);
            ref.current.scale.setScalar(0.07);
        }
    }, [isOpen]);

    return (
        <primitive
            object={scene}
            ref={ref}
            scale={0.07}
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

    const handleStart = () => {
        setIsOpen(true);
        onOpen();
    };

    return (
        <div className="scene-container">
            <div className="canvas-wrapper">
                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <ambientLight intensity={2.0} />
                    <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2.5} />
                    <pointLight position={[-10, 0, -10]} intensity={1.5} />

                    <Suspense fallback={null}>
                        <Model isOpen={isOpen} />
                        <Environment preset="city" background={false} />
                        <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2.5} far={10} color="#000000" />
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
                        <button className="action-btn secondary" onClick={() => setShowRules(true)}>
                            Règles du jeu
                        </button>
                        <button className="action-btn primary" onClick={handleStart}>
                            Commencer
                        </button>
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
                        <motion.div
                            className="rules-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <button
                                className="close-btn"
                                onClick={() => setShowRules(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    zIndex: 10
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <div className="rules-header">
                                <span className="rules-top-left">LE JEU</span>
                                <span className="rules-top-right">FEELLO</span>
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
