
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export const FeelloModel = ({ scale = 1, autoRotate = false }) => {
    const { scene, animations } = useGLTF('/boite_feeloo_v2.1.glb');
    const ref = useRef<THREE.Group>(null);
    useAnimations(animations, ref);

    // Initial rotation (Opposite wide face) as requested
    const INITIAL_ROTATION_Y = Math.PI * 1.5 + 0.5;

    useFrame((state) => {
        if (ref.current) {
            if (autoRotate) {
                // Continuous rotation for loader
                ref.current.rotation.y += 0.05;
                ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
            } else {
                // Passive sway for Intro
                ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
                ref.current.rotation.y = INITIAL_ROTATION_Y + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
            }
        }
    });

    return (
        <primitive
            object={scene}
            ref={ref}
            scale={scale}
            rotation={[0, INITIAL_ROTATION_Y, 0]}
        />
    );
};
