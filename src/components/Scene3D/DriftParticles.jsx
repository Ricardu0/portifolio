import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DriftParticles({ carRef, isActive, steeringAngleRef }) {
    const maxParticles = 100
    const instancedMeshRef = useRef()

    const dummy = useMemo(() => new THREE.Object3D(), [])

    const particleData = useMemo(() => ({
        velocities: Array.from({ length: maxParticles }, () => new THREE.Vector3()),
        lifetimes: new Float32Array(maxParticles),
        active: new Array(maxParticles).fill(false),
        spawnSide: new Array(maxParticles).fill(0) // 0 = esquerda, 1 = direita
    }), [])

    useFrame((state, delta) => {
        if (!carRef?.current || !instancedMeshRef.current) return

        const drifting = isActive?.current
        const steering = Math.abs(steeringAngleRef?.current || 0)
        const carPos = carRef.current.position
        const carRot = carRef.current.rotation.y

        // Spawn de novas partículas
        if (drifting && steering > 0.2) {
            const spawnRate = Math.min(steering * 2.5, 1) * 0.6

            if (Math.random() < spawnRate) {
                const inactiveIndex = particleData.active.findIndex(a => !a)
                if (inactiveIndex !== -1) {
                    const i = inactiveIndex

                    // Alterna entre roda esquerda e direita traseira
                    const isLeftWheel = Math.random() > 0.5
                    particleData.spawnSide[i] = isLeftWheel ? 0 : 1

                    // Posição das rodas traseiras no modelo
                    // Ajuste baseado na geometria: traseira está ~1.2 unidades atrás
                    const wheelOffsetX = isLeftWheel ? -0.7 : 0.7  // Largura entre rodas
                    const wheelOffsetZ = -1.2  // Distância até o eixo traseiro

                    // Rotaciona offset pelo ângulo do carro
                    const rotatedX = wheelOffsetX * Math.cos(carRot) - wheelOffsetZ * Math.sin(carRot)
                    const rotatedZ = wheelOffsetX * Math.sin(carRot) + wheelOffsetZ * Math.cos(carRot)

                    dummy.position.set(
                        carPos.x + rotatedX + (Math.random() - 0.5) * 0.3,
                        0.08 + Math.random() * 0.05,
                        carPos.z + rotatedZ + (Math.random() - 0.5) * 0.3
                    )

                    // Velocidade inicial (para trás e para os lados)
                    const spreadAngle = carRot + (Math.random() - 0.5) * 0.8
                    particleData.velocities[i].set(
                        Math.sin(spreadAngle) * (0.3 + Math.random() * 0.4),
                        Math.random() * 0.4 + 0.2,
                        Math.cos(spreadAngle) * (0.3 + Math.random() * 0.4)
                    )

                    particleData.lifetimes[i] = 1.0 + Math.random() * 0.3

                    dummy.scale.set(0.25, 0.25, 0.25)
                    dummy.updateMatrix()
                    instancedMeshRef.current.setMatrixAt(i, dummy.matrix)

                    particleData.active[i] = true
                }
            }
        }

        // Atualizar partículas
        let needsUpdate = false

        for (let i = 0; i < maxParticles; i++) {
            if (!particleData.active[i]) {
                // Esconde partículas inativas
                dummy.position.set(0, -100, 0)
                dummy.scale.set(0, 0, 0)
                dummy.updateMatrix()
                instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
                continue
            }

            particleData.lifetimes[i] -= delta * 1.8

            if (particleData.lifetimes[i] <= 0) {
                particleData.active[i] = false
                dummy.position.set(0, -100, 0)
                dummy.scale.set(0, 0, 0)
                dummy.updateMatrix()
                instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
                needsUpdate = true
                continue
            }

            // Recupera matriz atual
            instancedMeshRef.current.getMatrixAt(i, dummy.matrix)
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

            // Física
            dummy.position.add(particleData.velocities[i].clone().multiplyScalar(delta * 3))
            particleData.velocities[i].y -= delta * 2.5  // Gravidade
            particleData.velocities[i].multiplyScalar(0.88)  // Atrito do ar

            // Fade out
            const lifeRatio = particleData.lifetimes[i]
            const targetScale = lifeRatio * 0.35
            dummy.scale.set(targetScale, targetScale, targetScale)

            dummy.updateMatrix()
            instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
            needsUpdate = true
        }

        if (needsUpdate) {
            instancedMeshRef.current.instanceMatrix.needsUpdate = true
        }
    })

    return (
        <instancedMesh ref={instancedMeshRef} args={[null, null, maxParticles]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial
                color="#5a5a5a"
                transparent
                opacity={0.7}
                depthWrite={false}
            />
        </instancedMesh>
    )
}