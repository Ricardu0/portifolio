import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DriftParticles({ carRef, isActive, steeringAngleRef }) {
    const maxParticles = 50

    const particlePool = useMemo(() => (
        Array.from({ length: maxParticles }, () => ({
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            life: 0,
            maxLife: 1,
            active: false
        }))
    ), [])

    useFrame(() => {
        if (!carRef?.current) return

        const drifting = isActive?.current
        const steering = Math.abs(steeringAngleRef?.current || 0)

        if (drifting) {
            const spawnChance = steering > 0.3 ? steering * 0.8 : 0.15

            if (Math.random() < spawnChance) {
                const p = particlePool.find(p => !p.active)
                if (p) {
                    const carPos = carRef.current.position
                    const carRot = carRef.current.rotation.y

                    const side = (Math.random() - 0.5) * 1.2

                    p.position.set(
                        carPos.x + Math.sin(carRot) * side,
                        0.12,
                        carPos.z + Math.cos(carRot) * side - 0.8
                    )

                    p.velocity.set(
                        (Math.random() - 0.5) * 0.6,
                        Math.random() * 0.25,
                        (Math.random() - 0.5) * 0.6
                    )

                    p.life = 1
                    p.maxLife = 0.8 + Math.random() * 0.4
                    p.active = true
                }
            }
        }

        particlePool.forEach(p => {
            if (!p.active) return

            p.life -= 0.04
            if (p.life <= 0) {
                p.active = false
                return
            }

            p.position.add(p.velocity)
            p.velocity.y -= 0.015
            p.velocity.multiplyScalar(0.95)
        })
    })

    return (
        <group>
            {particlePool.map((p, i) => (
                p.active && (
                    <mesh key={i} position={p.position}>
                        <sphereGeometry args={[p.life * 0.15, 4, 4]} />
                        <meshBasicMaterial
                            color="#888"
                            transparent
                            opacity={p.life * 0.6}
                            depthWrite={false}
                        />
                    </mesh>
                )
            ))}
        </group>
    )
}
