// src/components/Scene3D/Scene.jsx
import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

import Car from './Car'
import Environment from './Environment'
import DriftParticles from './DriftParticles'
import Moon from './Moon'
import TreeClusters from './GeometricTree'
import Fog from './Fog'
import { removeFog } from './Fog'

function SceneContent({ onAnimationComplete }) {
    const carRef = useRef()
    const speedRef = useRef(0)
    const steeringAngleRef = useRef(0)
    const isDriftingRef = useRef(false)

    const followCameraRef = useRef(true)
    const cinematicCarFocusRef = useRef(false)
    const moonFocusRef = useRef(false)

    // Offset da câmera (ajustado para enquadrar o carro mais afastado)
    const cameraOffsetRef = useRef(new THREE.Vector3(3, 3, -14))
    const cameraShakeRef = useRef(0)

    // moonTargetRef será atualizado dinamicamente baseado na posição inicial do carro
    const moonTargetRef = useRef(new THREE.Vector3(0, 140, -300))
    const focusTargetRef = useRef(new THREE.Vector3())

    // Posição inicial do carro - mais atrás
    const initialCarPosition = useRef(new THREE.Vector3(0, 0, -70))

    const { camera } = useThree()
    const tlRef = useRef()
    const [showMoon, setShowMoon] = useState(false)

    // Estado para passar posição para o componente Moon (array para props)
    const [moonPosition, setMoonPosition] = useState([0, 140, -300])

    const forward = useRef(new THREE.Vector3())
    const desiredCamPos = useRef(new THREE.Vector3())
    const tmpVec = useRef(new THREE.Vector3())

    // ===== LOOP DE FRAME =====
    useFrame((state, delta) => {
        if (!carRef.current) return
        const car = carRef.current

        // ===== MOVIMENTO DO CARRO =====
        car.getWorldDirection(forward.current)
        forward.current.y = 0
        forward.current.normalize()

        const movementSpeed = speedRef.current * 18
        tmpVec.current.copy(forward.current).multiplyScalar(movementSpeed * delta)
        car.position.add(tmpVec.current)

        car.rotation.y += steeringAngleRef.current * delta * 0.18

        // ===== POSIÇÃO DA CÂMERA (FOLLOW) =====
        if (followCameraRef.current) {
            const offset = cameraOffsetRef.current.clone().applyQuaternion(car.quaternion)
            desiredCamPos.current.copy(car.position).add(offset)
            camera.position.lerp(desiredCamPos.current, 0.1)
        }

        // ===== FOCO COM HIERARQUIA =====
        if (moonFocusRef.current) {
            // Prioridade absoluta na lua
            focusTargetRef.current.lerp(moonTargetRef.current, 0.06)

        } else if (cinematicCarFocusRef.current) {
            // Frente do carro
            const carFront = car.position
                .clone()
                .add(forward.current.clone().multiplyScalar(16))

            focusTargetRef.current.lerp(carFront, 0.08)

        } else {
            // Follow padrão
            const followTarget = car.position
                .clone()
                .add(forward.current.clone().multiplyScalar(12))

            focusTargetRef.current.lerp(followTarget, 0.1)
        }

        camera.lookAt(focusTargetRef.current)

        camera.rotation.z = THREE.MathUtils.lerp(
            camera.rotation.z,
            -steeringAngleRef.current * 0.12,
            0.08
        )

        const shake = cameraShakeRef.current
        camera.position.y += Math.sin(state.clock.elapsedTime * 20) * shake
        camera.position.x += Math.cos(state.clock.elapsedTime * 14) * shake * 0.4
    })

    // ===== POSIÇÃO INICIAL DO CARRO E POSIÇÃO DA LUA RELACIONADA =====
    useEffect(() => {
        // garante que o carro exista antes de aplicar posição
        if (!carRef.current) return

        // aplica a posição inicial do carro (puxada para trás)
        carRef.current.position.copy(initialCarPosition.current)

        // calcula a posição da lua relativa ao carro (mantém a lua mais distante)
        const desiredMoonZ = carRef.current.position.z - 240 // distância atrás do carro
        const moonPos = new THREE.Vector3(0, 140, desiredMoonZ)

        // atualiza target usado pelo foco da câmera
        moonTargetRef.current.copy(moonPos)

        // atualiza estado que passamos ao componente Moon
        setMoonPosition([moonPos.x, moonPos.y, moonPos.z])
    }, [])

    // ===== TIMELINE CINEMÁTICA (GSAP) =====
    useEffect(() => {
        if (tlRef.current || !carRef.current) return

        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
        tlRef.current = tl

        // SPAWN
        tl.fromTo(
            carRef.current.scale,
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0.8, z: 0.8, duration: 0.9, ease: 'back.out(1.6)' }
        )

        tl.to(speedRef, { current: 6.2, duration: 1.6 })
        tl.to(speedRef, { current: 3.8, duration: 0.4 })

        // DRIFT
        tl.to(isDriftingRef, { current: true, duration: 0.05 })
        tl.to(steeringAngleRef, { current: 1.1, duration: 0.25 })

        tl.to(carRef.current.rotation, {
            y: `+=${Math.PI}`,
            duration: 1.2,
            ease: 'power1.inOut',
            onUpdate() {
                steeringAngleRef.current =
                    Math.sin(this.progress() * Math.PI) * 1.2
            }
        })

        tl.to(steeringAngleRef, { current: 0, duration: 0.4 })
        tl.to(isDriftingRef, { current: false, duration: 0.3 })
        tl.to(speedRef, { current: 0, duration: 1 })

        // REMOVER FOG ANTES DE FOCAR NA LUA
        tl.call(() => {
            removeFog(3.0) // Remove fog em 1.8 segundos
        })


        // ETAPA 1 — FRENTE DO CARRO
        tl.call(() => {
            followCameraRef.current = false
            cinematicCarFocusRef.current = true
        })

        tl.to(camera.position, {
            x: 0,
            y: 12,
            z: carRef.current.position.z + 18,
            duration: 2
        })

        // ETAPA 2 — FOCO FINAL NA LUA
        tl.call(() => {
            cinematicCarFocusRef.current = false
            moonFocusRef.current = true
            setShowMoon(true)
        })

        // camera baixa, olhando pra cima; usa carRef.current.position.z como base
        tl.to(camera.position, {
            x: 6,
            y: 8,
            z: carRef.current.position.z + 46,
            duration: 2.6,
            ease: 'power2.inOut'
        })

        tl.call(() => {
            onAnimationComplete?.()
        })
    }, [camera, onAnimationComplete])

    return (
        <>
            <Environment />
            {/* Passamos posição calculada para o Moon */}
            <Moon visible={showMoon} position={moonPosition} />

            <Car
                carRef={carRef}
                speedRef={speedRef}
                steeringAngleRef={steeringAngleRef}
            />

            <TreeClusters enabled={false}/>

            <DriftParticles
                carRef={carRef}
                isActive={isDriftingRef}
                steeringAngleRef={steeringAngleRef}
            />
        </>
    )
}

export default function Scene({ onAnimationComplete }) {
    return (
        <Canvas
            // câmera iniciando mais atrás para não fazer 'teleporte'
            camera={{ position: [0, 5, -35], fov: 52 }}
            shadows
        >
            <SceneContent onAnimationComplete={onAnimationComplete} />
        </Canvas>
    )
}
