// src/components/Scene3D/Moon.jsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export default function Moon({ visible = false }) {
    const moonRef = useRef()
    const glowRef = useRef()
    const opacityRef = useRef(0)

    useEffect(() => {
        if (!moonRef.current || !glowRef.current) return

        if (visible) {
            gsap.to(opacityRef, {
                current: 1,
                duration: 2.5,
                ease: 'power2.out'
            })
        } else {
            gsap.to(opacityRef, {
                current: 0,
                duration: 1.0,
                ease: 'power2.in'
            })
        }
    }, [visible])

    useFrame((state) => {
        if (!moonRef.current || !glowRef.current) return

        const opacity = opacityRef.current
        moonRef.current.material.opacity = opacity
        glowRef.current.material.opacity = opacity * 0.3

        // Respiração suave
        const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
        moonRef.current.scale.setScalar(1 + breathe)
        glowRef.current.scale.setScalar(1.4 + breathe * 0.3)
    })

    return (
        // Posição no canto superior DIREITO
        <group position={[25, 60, -40]}>
            {/* Brilho externo */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[5, 32, 32]} />
                <meshBasicMaterial
                    color="#ffffee"
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>

            {/* Lua */}
            <mesh ref={moonRef}>
                <sphereGeometry args={[3.5, 32, 32]} />
                <meshStandardMaterial
                    color="#f5f5dc"
                    emissive="#ffffcc"
                    emissiveIntensity={0.9}
                    roughness={0.35}
                    metalness={0}
                    transparent
                    opacity={0}
                />
            </mesh>

            {/* Luz da lua */}
            <pointLight
                position={[0, 0, 5]}
                intensity={opacityRef.current * 0.3}
                color="#ffffee"
                distance={60}
            />
        </group>
    )
}