import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import './IntroBox.css';

interface IntroBoxProps {
    onOpen: () => void;
}

const Model = ({ isOpen }: { isOpen: boolean }) => {
    const { scene } = useGLTF('/boite_feeloo_v2.1.glb');
    const ref = useRef<THREE.Group>(null);
    const openTimeRef = useRef<number | null>(null);

    // Initial rotation (Opposite wide face) as requested
    // Ensure this matches the visual "Wide Face" the user liked
    const INITIAL_ROTATION_Y = Math.PI * 1.5 + 0.5;

    useFrame((state) => {
        if (ref.current) {
            if (!isOpen) {
                // Gentle idle hover
                ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
                ref.current.position.x = 0;
                ref.current.position.z = 0;
                ref.current.rotation.y = INITIAL_ROTATION_Y; // Keep reset orientation
                ref.current.rotation.x = 0;
                ref.current.rotation.z = 0;

                openTimeRef.current = null; // Reset timer
            } else {
                // ANIMATION SEQUENCE
                if (openTimeRef.current === null) {
                    openTimeRef.current = state.clock.elapsedTime;
                }

                const elapsed = state.clock.elapsedTime - openTimeRef.current;

                // Phase 1: ROTATE TO FRONT (0s to 0.6s)
                if (elapsed < 0.6) {
                    const t = elapsed / 0.6;
                    // Easing (easeOutCubic)
                    const ease = 1 - Math.pow(1 - t, 3);

                    // Rotate from Initial Y to Front (Math.PI or 0? Let's assume Math.PI is 'Back' of scene, i.e. facing camera)
                    // Actually, usually 0 is front. Let's try rotating to essentially 'Flat facing camera'.
                    // If INITIAL is ~270deg, we want to rotate to 180 (PI) or 0 (2PI).
                    // Let's rotate to Math.PI * 2 (360) for a nice spin, or just Math.PI (180).
                    // Let's aim for stable Front view = Math.PI (depends on model axis).
                    // Let's try lerping to Math.PI.

                    // Smooth rotation
                    ref.current.rotation.y = THREE.MathUtils.lerp(INITIAL_ROTATION_Y, Math.PI, ease);

                    // Slight lift to anticipate drop
                    ref.current.position.y = THREE.MathUtils.lerp(0, 0.5, ease);
                }
                // Phase 2: DROP (0.6s onwards)
                else {
                    const dropElapsed = elapsed - 0.6;
                    // Accelerate down
                    ref.current.position.y = 0.5 - (dropElapsed * dropElapsed * 5); // Gravity-ish

                    // Add some tumbles as it falls
                    ref.current.rotation.x += 0.05;
                    ref.current.rotation.z += 0.02;
                }
            }
        }
    });

    // Reset logic is handled in the 'else' block of useFrame roughly, but let's ensure cleanup
    useEffect(() => {
        if (!isOpen && ref.current) {
            ref.current.position.set(0, 0, 0);
            ref.current.rotation.set(0, INITIAL_ROTATION_Y, 0);
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
        // Reset camera and controls when component mounts or "isOpen" changes back to false (home screen)
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
        // Call onOpen immediately to mount the GameCard (it will be behind/layered)
        onOpen();
    };

    return (
        <div className="scene-container">
            <div className="canvas-wrapper">
                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    {/* Brighter Lighting */}
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
                    transition={{ delay: 0.2 }} // Faster UI fade in
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

            {showRules && (
                <div className="rules-modal" onClick={() => setShowRules(false)}>
                    <div className="rules-content" onClick={e => e.stopPropagation()}>
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
                    </div>
                </div>
            )}
        </div>
    );
};
