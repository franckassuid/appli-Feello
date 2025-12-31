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

    // Initial rotation (Opposite wide face)
    const INITIAL_ROTATION = [0, Math.PI * 1.5 + 0.5, 0];

    useFrame((state) => {
        if (ref.current) {
            if (!isOpen) {
                // Gentle idle hover
                ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
                ref.current.position.x = 0; // Reset X
                ref.current.position.z = 0; // Reset Z
            } else {
                // FALL DOWN animation
                ref.current.position.y -= 0.4;
                ref.current.rotation.x += 0.1;
                ref.current.rotation.z += 0.05;
            }
        }
    });

    // Reset logic when returning to home
    useEffect(() => {
        if (!isOpen && ref.current) {
            ref.current.position.set(0, 0, 0);
            ref.current.rotation.set(0, Math.PI * 1.5 + 0.5, 0); // Reset to opposite wide view
        }
    }, [isOpen]);

    return (
        <primitive
            object={scene}
            ref={ref}
            scale={0.07}
            rotation={INITIAL_ROTATION}
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
        // NO DELAY for instant transition
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
