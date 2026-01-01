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

    useEffect(() => {
        frontSteeringPivots.current = []
        frontRotationPivots.current = []
        rearRotationPivots.current = []

        const frontWheels = []
        const rearWheels = []

        scene.traverse((child) => {
            if (!child || !child.name) return
            const name = child.name.toLowerCase()

            if (name.includes('cube003_materiais') || name.includes('cube.003_materiais')) {
                frontWheels.push(child)
            }
            else if (name.includes('cube001_materiais') || name.includes('cube.001_materiais')) {
                rearWheels.push(child)
            }
        })

        const createDualPivotForFrontWheel = (wheelMesh) => {
            if (!wheelMesh.parent) return null
            const box = new THREE.Box3().setFromObject(wheelMesh)
            const center = new THREE.Vector3()
            box.getCenter(center)

            const isLeftWheel = center.x < 0
            const wheelWidth = box.max.x - box.min.x

            // 🔧 CORREÇÃO: Mudei de 0.35 para 0.05 (pivô mais externo)
            // Quanto MENOR o número, mais EXTERNO fica o pivô
            // Teste valores entre 0.0 (borda extrema) e 0.2 (mais interno)
            const pivotOffset = 0.05
            const pivotX = isLeftWheel
                ? (center.x + wheelWidth * pivotOffset)  // Roda esquerda
                : (center.x - wheelWidth * pivotOffset)  // Roda direita

            const pivotPosition = new THREE.Vector3(pivotX, center.y, center.z)

            const steeringPivot = new THREE.Object3D()
            steeringPivot.position.copy(pivotPosition)
            wheelMesh.parent.add(steeringPivot)

            const rotationPivot = new THREE.Object3D()
            steeringPivot.add(rotationPivot)

            const offset = wheelMesh.position.clone().sub(pivotPosition)
            wheelMesh.removeFromParent()
            rotationPivot.add(wheelMesh)
            wheelMesh.position.copy(offset)

            return { steeringPivot, rotationPivot }
        }

        const createSinglePivotForRearWheel = (wheelMesh) => {
            if (!wheelMesh.parent) return null
            const box = new THREE.Box3().setFromObject(wheelMesh)
            const center = new THREE.Vector3()
            box.getCenter(center)

            const isLeftWheel = center.x < 0
            const wheelWidth = box.max.x - box.min.x

            // Traseiras não esterçam, então pode manter no centro
            const pivotX = isLeftWheel ? (center.x + wheelWidth * 0.35) : (center.x - wheelWidth * 0.35)
            const pivotPosition = new THREE.Vector3(pivotX, center.y, center.z)

            const pivot = new THREE.Object3D()
            pivot.position.copy(pivotPosition)
            wheelMesh.parent.add(pivot)

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
                pivot.rotation.order = 'YXZ'
                rearRotationPivots.current.push(pivot)
            }
        })

    }, [scene])

    useFrame((state, delta) => {
        const speed = speedRef?.current || 0
        const targetSteering = steeringAngleRef?.current || 0
        const rotAmount = speed * delta * 4.0

        currentSteeringRef.current = THREE.MathUtils.lerp(
            currentSteeringRef.current,
            targetSteering,
            0.15
        )

        const visualSteering = currentSteeringRef.current

        frontSteeringPivots.current.forEach((pivot) => {
            if (pivot) {
                // Eixo Z funcionou! Mantenha assim
                pivot.rotation.z = visualSteering

                // Se virar para o lado errado, inverta o sinal:
                // pivot.rotation.z = -visualSteering
            }
        })

        frontRotationPivots.current.forEach((pivot) => {
            if (pivot) pivot.rotation.x -= rotAmount
        })

        rearRotationPivots.current.forEach((pivot) => {
            if (pivot) pivot.rotation.x -= rotAmount
        })
    })

    return (
        <group ref={carRef}>
            <primitive object={scene} />
        </group>
    )
}
