import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Car({ carRef, speedRef, steeringAngleRef }) {
    const { scene } = useGLTF('/models/gol.glb')

    const frontWheelMeshes = useRef([])
    const rearWheelMeshes = useRef([])

    const frontSteeringPivots = useRef([])
    const frontRotationPivots = useRef([])
    const rearRotationPivots = useRef([])

    const accRef = useRef(0)
    const timestep = 1 / 30
    const velocityRef = useRef(0)
    const currentSteeringRef = useRef(0)
    const driftTiltRef = useRef(0)

    useEffect(() => {
        frontWheelMeshes.current = []
        rearWheelMeshes.current = []
        frontSteeringPivots.current = []
        frontRotationPivots.current = []
        rearRotationPivots.current = []

        scene.traverse((child) => {
            if (!child || !child.name) return
            const name = child.name.toLowerCase()

            if (name.includes('cube003_materiais') || name.includes('cube.003_materiais')) {
                frontWheelMeshes.current.push(child)
                console.log('[Car] ✅ Roda DIANTEIRA:', child.name)
            }
            else if (name.includes('cube001_materiais') || name.includes('cube.001_materiais')) {
                rearWheelMeshes.current.push(child)
                console.log('[Car] ✅ Roda TRASEIRA:', child.name)
            }
        })

        // FUNÇÃO CORRIGIDA - Pivot no eixo da roda, não no centro
        const createDualPivotForFrontWheel = (wheelMesh) => {
            if (!wheelMesh.parent) return null

            const box = new THREE.Box3().setFromObject(wheelMesh)
            const center = new THREE.Vector3()
            box.getCenter(center)

            // CORREÇÃO: Detecta se é roda esquerda ou direita
            // e ajusta o pivot para a borda INTERNA (perto da carroceria)
            const isLeftWheel = center.x < 0  // Esquerda do carro

            // Calcula largura da roda
            const wheelWidth = box.max.x - box.min.x

            // Pivot vai na borda INTERNA (perto do centro do carro)
            const pivotX = isLeftWheel ? (center.x + wheelWidth * 0.30) : (center.x - wheelWidth * 0.45)

            const pivotPosition = new THREE.Vector3(
                pivotX,      // Borda interna da roda
                center.y,    // Mesma altura
                center.z     // Mesma profundidade
            )

            console.log('[Car] 🔧 Roda:', wheelMesh.name)
            console.log('    Centro original:', center.x.toFixed(2))
            console.log('    Pivot ajustado:', pivotX.toFixed(2))
            console.log('    Lado:', isLeftWheel ? 'ESQUERDA' : 'DIREITA')

            // 1) PIVOT EXTERNO - Esterçamento (Y)
            const steeringPivot = new THREE.Object3D()
            steeringPivot.position.copy(pivotPosition)
            wheelMesh.parent.add(steeringPivot)

            // 2) PIVOT INTERNO - Rotação da roda (X)
            const rotationPivot = new THREE.Object3D()
            rotationPivot.position.set(0, 0, 0)
            steeringPivot.add(rotationPivot)

            // 3) Move a roda para dentro do pivot de rotação
            const offset = wheelMesh.position.clone().sub(pivotPosition)
            wheelMesh.removeFromParent()
            rotationPivot.add(wheelMesh)
            wheelMesh.position.copy(offset)

            return { steeringPivot, rotationPivot }
        }

        // Pivot simples para traseiras (mesmo ajuste)
        const createSinglePivotForRearWheel = (wheelMesh) => {
            if (!wheelMesh.parent) return null

            const box = new THREE.Box3().setFromObject(wheelMesh)
            const center = new THREE.Vector3()
            box.getCenter(center)

            // Mesma correção para traseiras
            const isLeftWheel = center.x < 0
            const wheelWidth = box.max.x - box.min.x
            const pivotX = isLeftWheel ? (center.x + wheelWidth * 0.45) : (center.x - wheelWidth * 0.45)

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

        // Cria pivots
        frontWheelMeshes.current.forEach((wheel) => {
            const pivots = createDualPivotForFrontWheel(wheel)
            if (pivots) {
                frontSteeringPivots.current.push(pivots.steeringPivot)
                frontRotationPivots.current.push(pivots.rotationPivot)
            }
        })

        rearWheelMeshes.current.forEach((wheel) => {
            const pivot = createSinglePivotForRearWheel(wheel)
            if (pivot) rearRotationPivots.current.push(pivot)
        })

        console.log('[Car] ✅ Pivots criados:', frontSteeringPivots.current.length, 'dianteiros')

    }, [scene])

    useFrame((state, delta) => {
        accRef.current += delta
        if (accRef.current < timestep) return
        const steps = Math.floor(accRef.current / timestep)
        accRef.current -= steps * timestep

        const speed = speedRef?.current || 0
        const rotFactor = 3.0

        for (let i = 0; i < steps; i++) {
            const rotAmount = speed * timestep * rotFactor

            const targetSteering = steeringAngleRef?.current || 0
            currentSteeringRef.current = THREE.MathUtils.lerp(
                currentSteeringRef.current,
                targetSteering,
                0.15
            )

            // Esterçamento
            frontSteeringPivots.current.forEach((steeringPivot) => {
                if (steeringPivot) {
                    steeringPivot.rotation.y = currentSteeringRef.current
                }
            })

            // Rotação das rodas
            frontRotationPivots.current.forEach((rotationPivot) => {
                if (rotationPivot) {
                    rotationPivot.rotation.x -= rotAmount
                }
            })

            rearRotationPivots.current.forEach((pivot) => {
                if (pivot) {
                    pivot.rotation.x -= rotAmount
                }
            })

            // Inclinação do drift
            const targetTilt = -currentSteeringRef.current * 0.8
            driftTiltRef.current = THREE.MathUtils.lerp(
                driftTiltRef.current,
                targetTilt,
                0.1
            )

            // Movimento do carro
            const desiredVel = -speed
            velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, desiredVel, 0.12)

            if (carRef?.current) {
                carRef.current.position.z += velocityRef.current * timestep

                carRef.current.rotation.x = THREE.MathUtils.lerp(
                    carRef.current.rotation.x,
                    -velocityRef.current * 0.03,
                    0.12
                )

                carRef.current.rotation.z = driftTiltRef.current
            }
        }
    })

    return (
        <group
            ref={carRef}
            scale={0.8}
            position={[4, 0, -6]}
            rotation={[0, 0.5, 0]}
        >
            <primitive object={scene} />
        </group>
    )
}
