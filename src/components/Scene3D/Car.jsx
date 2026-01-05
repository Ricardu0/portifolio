// src/components/Scene3D/Car.jsx
import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Car({ carRef, speedRef, steeringAngleRef }) {
    const { scene } = useGLTF('/models/gol.glb')

    const frontSteeringPivots = useRef([])
    const frontRotationPivots = useRef([])
    const rearRotationPivots = useRef([])
    const currentSteeringRef = useRef(0)
    const headlightMeshesRef = useRef([])

    // 🔦 Refs para controlar as luzes
    const leftSpotLightRef = useRef()
    const rightSpotLightRef = useRef()
    const leftTargetRef = useRef()
    const rightTargetRef = useRef()

    // 🎯 CONFIGURAÇÕES AJUSTÁVEIS
    const MAX_STEERING_ANGLE = Math.PI / 10
    const WHEEL_SCALE = 0.99
    const WHEEL_LATERAL_OFFSET = 0.1

    useEffect(() => {
        frontSteeringPivots.current = []
        frontRotationPivots.current = []
        rearRotationPivots.current = []
        headlightMeshesRef.current = []

        const frontWheels = []
        const rearWheels = []

        scene.traverse((child) => {
            if (!child || !child.name) return
            const name = child.name.toLowerCase()

            // 💡 ENCONTRAR FARÓIS
            if ((name.includes('cube005_farois') || name.includes('cube006_farois')) && child.isMesh) {
                headlightMeshesRef.current.push(child)

                if (child.material) {
                    child.material = child.material.clone()
                    child.material.emissive = new THREE.Color('#fffacd')
                    child.material.emissiveIntensity = 2.0
                }
            }

            // Rodas
            if (name.includes('cube003_materiais') || name.includes('cube.003_materiais')) {
                frontWheels.push(child)
            } else if (name.includes('cube001_materiais') || name.includes('cube.001_materiais')) {
                rearWheels.push(child)
            }
        })

        const createDualPivotForFrontWheel = (wheelMesh) => {
            if (!wheelMesh.parent) return null

            const parent = wheelMesh.parent

            // Calcular centro da roda (MUNDO)
            const box = new THREE.Box3().setFromObject(wheelMesh)
            const centerWorld = new THREE.Vector3()
            box.getCenter(centerWorld)

            // 🔥 FIX: Converter de coordenadas mundiais para locais do pai
            const centerLocal = parent.worldToLocal(centerWorld.clone())

            const isLeftWheel = centerLocal.x < 0

            // 🔧 Pivot no centro + offset lateral
            const lateralOffset = isLeftWheel ? -WHEEL_LATERAL_OFFSET : WHEEL_LATERAL_OFFSET
            const pivotPosition = new THREE.Vector3(
                centerLocal.x + lateralOffset,
                centerLocal.y,
                centerLocal.z
            )

            // Criar pivot de steering (direção)
            const steeringPivot = new THREE.Object3D()
            steeringPivot.position.copy(pivotPosition)
            steeringPivot.rotation.order = 'ZXY' // 🔥 FIX: Ordem explícita
            parent.add(steeringPivot)

            // Criar pivot de rotação (girar a roda)
            const rotationPivot = new THREE.Object3D()
            rotationPivot.rotation.order = 'ZXY' // 🔥 FIX: Ordem explícita
            steeringPivot.add(rotationPivot)

            // 📏 APLICAR ESCALA NA RODA
            wheelMesh.scale.multiplyScalar(WHEEL_SCALE)

            // Calcular offset da roda em relação ao pivot
            const offset = wheelMesh.position.clone().sub(pivotPosition)
            wheelMesh.removeFromParent()
            rotationPivot.add(wheelMesh)
            wheelMesh.position.copy(offset)

            return { steeringPivot, rotationPivot }
        }

        const createSinglePivotForRearWheel = (wheelMesh) => {
            if (!wheelMesh.parent) return null

            const parent = wheelMesh.parent

            const box = new THREE.Box3().setFromObject(wheelMesh)
            const centerWorld = new THREE.Vector3()
            box.getCenter(centerWorld)

            // 🔥 FIX: Converter de coordenadas mundiais para locais
            const centerLocal = parent.worldToLocal(centerWorld.clone())

            const isLeftWheel = centerLocal.x < 0
            const wheelWidth = box.max.x - box.min.x

            // Pivot para rodas traseiras
            const pivotX = isLeftWheel ? (centerLocal.x + wheelWidth * 0.35) : (centerLocal.x - wheelWidth * 0.35)
            const pivotPosition = new THREE.Vector3(pivotX, centerLocal.y, centerLocal.z)

            const pivot = new THREE.Object3D()
            pivot.position.copy(pivotPosition)
            pivot.rotation.order = 'YXZ' // 🔥 FIX: Ordem explícita
            parent.add(pivot)

            // 📏 APLICAR ESCALA
            wheelMesh.scale.multiplyScalar(WHEEL_SCALE)

            const offset = wheelMesh.position.clone().sub(pivotPosition)
            wheelMesh.removeFromParent()
            pivot.add(wheelMesh)
            wheelMesh.position.copy(offset)

            return pivot
        }

        frontWheels.forEach((wheel) => {
            const pivots = createDualPivotForFrontWheel(wheel)
            if (pivots) {
                frontSteeringPivots.current.push(pivots.steeringPivot)
                frontRotationPivots.current.push(pivots.rotationPivot)
            }
        })

        rearWheels.forEach((wheel) => {
            const pivot = createSinglePivotForRearWheel(wheel)
            if (pivot) {
                rearRotationPivots.current.push(pivot)
            }
        })

    }, [scene])

    useFrame((state, delta) => {
        const speed = speedRef?.current || 0
        const targetSteering = steeringAngleRef?.current || 0
        const rotAmount = speed * delta * 4.0

        // 🚨 LIMITAR O ÂNGULO DE STEERING
        const clampedSteering = THREE.MathUtils.clamp(
            targetSteering,
            -MAX_STEERING_ANGLE,
            MAX_STEERING_ANGLE
        )

        // 🎯 Suavização do steering
        currentSteeringRef.current = THREE.MathUtils.lerp(
            currentSteeringRef.current,
            clampedSteering,
            0.15
        )

        const visualSteering = currentSteeringRef.current

        // Aplicar rotação de steering (eixo Z para virar as rodas)
        frontSteeringPivots.current.forEach((pivot) => {
            if (pivot) pivot.rotation.z = visualSteering
        })

        // Rotação das rodas (eixo X para simular movimento)
        frontRotationPivots.current.forEach((pivot) => {
            if (pivot) pivot.rotation.x -= rotAmount
        })

        rearRotationPivots.current.forEach((pivot) => {
            if (pivot) pivot.rotation.x -= rotAmount
        })

        // 💡 ANIMAR BRILHO DOS FARÓIS
        if (headlightMeshesRef.current.length > 0) {
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 1.7
            headlightMeshesRef.current.forEach(headlight => {
                if (headlight && headlight.material) {
                    headlight.material.emissiveIntensity = pulse
                }
            })
        }

        // 🎯 ATUALIZAR TARGETS DAS LUZES
        if (carRef.current && leftTargetRef.current && rightTargetRef.current) {
            const carDirection = new THREE.Vector3(0, 0, 1)
            carDirection.applyQuaternion(carRef.current.quaternion)

            const leftLightPos = new THREE.Vector3()
            const rightLightPos = new THREE.Vector3()

            if (leftSpotLightRef.current) {
                leftSpotLightRef.current.getWorldPosition(leftLightPos)
            }
            if (rightSpotLightRef.current) {
                rightSpotLightRef.current.getWorldPosition(rightLightPos)
            }

            leftTargetRef.current.position.copy(leftLightPos).add(carDirection.multiplyScalar(10))
            rightTargetRef.current.position.copy(rightLightPos).add(carDirection.clone().multiplyScalar(10))
        }
    })

    return (
        <group ref={carRef}>
            <primitive object={scene} />

            {/* 💡 FARÓIS COM TARGETS CONFIGURADOS */}
            <group>
                {/* Farol Esquerdo */}
                <spotLight
                    ref={leftSpotLightRef}
                    position={[-7, 1, 6]}
                    angle={1.3}
                    penumbra={0.4}
                    intensity={12}
                    distance={20}
                    color="#fff8e1"
                    castShadow
                    shadow-bias={-0.0001}
                    target={leftTargetRef.current}
                />

                {/* Farol Direito */}
                <spotLight
                    ref={rightSpotLightRef}
                    position={[-3, 1, 6]}
                    angle={1.3}
                    penumbra={0.4}
                    intensity={12}
                    distance={25}
                    color="#fff8e1"
                    castShadow
                    shadow-bias={-0.0001}
                    target={rightTargetRef.current}
                />

                {/* ✨ Glow adicional */}
                <pointLight
                    position={[-7, 1, 6]}
                    intensity={2}
                    distance={5}
                    color="#fffacd"
                />
                <pointLight
                    position={[-3, 1, 6]}
                    intensity={2}
                    distance={5}
                    color="#fffacd"
                />
            </group>

            {/* 🎯 TARGETS INVISÍVEIS */}
            <object3D ref={leftTargetRef} position={[-1, 0.5, 11.8]} />
            <object3D ref={rightTargetRef} position={[0.6, 0.5, 11.8]} />
        </group>
    )
}
