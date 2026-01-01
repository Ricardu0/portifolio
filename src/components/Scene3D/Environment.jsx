import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Environment.jsx - Ambiente Noturno Azul Cinematográfico
 * - Iluminação aprimorada em tons de azul
 * - Modo escuro sofisticado
 * - Folhas com física realista
 */

export default function Environment() {
    const { scene, camera } = useThree()
    const groundRef = useRef()

    // Background azul escuro noturno
    scene.background = new THREE.Color('#0a0e1a')
    scene.fog = new THREE.Fog('#1a1f3a', 180, 550)

    // Chão infinito seguindo câmera
    useFrame(() => {
        if (!groundRef.current) return
        groundRef.current.position.x = Math.floor(camera.position.x / 40) * 40
        groundRef.current.position.z = Math.floor(camera.position.z / 40) * 40
    })

    return (
        <>
            {/* ILUMINAÇÃO CINEMATOGRÁFICA AZUL */}
            {/* Luz ambiente azulada suave */}
            <ambientLight intensity={0.4} color="#4a5f8c" />

            {/* Luz principal - Luar azul */}
            <directionalLight
                position={[60, 80, 50]}
                intensity={1.8}
                color="#b8d4ff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={10}
                shadow-camera-far={600}
                shadow-camera-left={-250}
                shadow-camera-right={250}
                shadow-camera-top={250}
                shadow-camera-bottom={-250}
                shadow-bias={-0.0001}
            />

            {/* Luz de preenchimento lateral - azul claro */}
            <directionalLight
                position={[-40, 30, -30]}
                intensity={0.6}
                color="#7aa3d6"
            />

            {/* Luz hemisférica - contraste céu/terra */}
            <hemisphereLight
                skyColor="#3d5a80"
                groundColor="#1a2332"
                intensity={0.7}
            />

            {/* Luz pontual suave para profundidade */}
            <pointLight
                position={[0, 15, 0]}
                intensity={0.5}
                color="#6a8caf"
                distance={100}
                decay={2}
            />

            {/* CHÃO */}
            <group ref={groundRef}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[1400, 1400]} />
                    {/* Chão azul escuro asfáltico */}
                    <meshStandardMaterial
                        color="#1a2838"
                        roughness={0.9}
                        metalness={0.1}
                        emissive="#0a1520"
                        emissiveIntensity={0.15}
                    />
                </mesh>
            </group>

            {/* SISTEMA DE FOLHAS */}
            <LeavesField
                count={30000}
                spread={425}
                floorY={0.01}
                camera={camera}
            />
        </>
    )
}

/* ======================
   LeavesField - Sistema de física
   ====================== */
function LeavesField({ count = 15000, spread = 950, floorY = 0.01, camera }) {
    const meshRef = useRef()
    const vehicleRef = useRef({
        x: 0,
        z: 0,
        vx: 0,
        vz: 0,
        speed: 0,
        width: 4.5,
        length: 4.5
    })

    const positionsRef = useRef(null)
    const velocitiesRef = useRef(null)
    const scalesRef = useRef(null)
    const colorsRef = useRef(null)
    const seedsRef = useRef(null)

    const dummy = useRef(new THREE.Object3D())
    const tmpColor = useRef(new THREE.Color())

    // Geometria plana no eixo XZ
    const planeGeo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        const vertices = new Float32Array([
            -0.5, 0, -0.5,
            0.5, 0, -0.5,
            0.5, 0,  0.5,
            -0.5, 0,  0.5,
        ])
        const indices = [0, 1, 2, 0, 2, 3]
        const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])

        g.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        g.setIndex(indices)
        g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        g.computeVertexNormals()
        return g
    }, [])

    const mat = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#6fb87a',
            roughness: 0.75,
            metalness: 0.05,
            side: THREE.DoubleSide,
            transparent: true,
            vertexColors: true,
            opacity: 0.9,
            emissive: '#3d5a40',
            emissiveIntensity: 0.15
        })
    }, [])

    // Inicialização
    useEffect(() => {
        const pos = new Float32Array(count * 3)
        const vel = new Float32Array(count * 3)
        const sc = new Float32Array(count)
        const cols = new Float32Array(count * 3)
        const seeds = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * spread
            pos[i * 3 + 1] = floorY
            pos[i * 3 + 2] = (Math.random() - 0.5) * spread

            vel[i * 3] = (Math.random() - 0.5) * 0.005
            vel[i * 3 + 1] = 0
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005

            sc[i] = 0.2 + Math.random() * 0.4

            // Cores verdes clarinhas vibrantes
            const rand = Math.random()
            let hue, sat, light

            if (rand < 0.5) {
                // Verde claro vibrante
                hue = 0.28 + Math.random() * 0.12
                sat = 0.5 + Math.random() * 0.35
                light = 0.45 + Math.random() * 0.25
            } else if (rand < 0.75) {
                // Verde lima claro
                hue = 0.22 + Math.random() * 0.08
                sat = 0.55 + Math.random() * 0.3
                light = 0.5 + Math.random() * 0.2
            } else {
                // Verde amarelado claro
                hue = 0.18 + Math.random() * 0.1
                sat = 0.45 + Math.random() * 0.35
                light = 0.55 + Math.random() * 0.2
            }

            const c = new THREE.Color()
            c.setHSL(hue, sat, light)
            cols[i * 3] = c.r
            cols[i * 3 + 1] = c.g
            cols[i * 3 + 2] = c.b

            seeds[i] = Math.random() * 1000
        }

        positionsRef.current = pos
        velocitiesRef.current = vel
        scalesRef.current = sc
        colorsRef.current = cols
        seedsRef.current = seeds

        if (meshRef.current) {
            const mesh = meshRef.current
            for (let i = 0; i < count; i++) {
                const x = pos[i * 3]
                const y = pos[i * 3 + 1]
                const z = pos[i * 3 + 2]
                const s = sc[i]
                const rotY = Math.random() * Math.PI * 2

                dummy.current.position.set(x, y, z)
                dummy.current.rotation.set(0, rotY, 0)
                dummy.current.scale.set(s, 1, s)
                dummy.current.updateMatrix()
                mesh.setMatrixAt(i, dummy.current.matrix)

                tmpColor.current.setRGB(cols[i * 3], cols[i * 3 + 1], cols[i * 3 + 2])
                mesh.setColorAt(i, tmpColor.current)
            }
            mesh.instanceMatrix.needsUpdate = true
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
        }
    }, [count, spread, floorY])

    // Loop de física
    useFrame((state, delta) => {
        if (!meshRef.current || !positionsRef.current) return

        const t = state.clock.getElapsedTime()
        const pos = positionsRef.current
        const vel = velocitiesRef.current
        const sc = scalesRef.current
        const cols = colorsRef.current
        const seeds = seedsRef.current
        const mesh = meshRef.current
        const camPos = state.camera.position

        const vehicle = vehicleRef.current
        const prevX = vehicle.x
        const prevZ = vehicle.z
        vehicle.x = camPos.x
        vehicle.z = camPos.z
        vehicle.vx = (vehicle.x - prevX) / Math.max(delta, 0.001)
        vehicle.vz = (vehicle.z - prevZ) / Math.max(delta, 0.001)
        vehicle.speed = Math.sqrt(vehicle.vx * vehicle.vx + vehicle.vz * vehicle.vz)

        const windBase = 0.03
        const windTurb = 0.08
        const gravity = -1.62
        const damping = 0.05
        const airDamping = 0.02
        const bounceFactor = 0.02
        const maxDist = 600
        const maxDistSq = maxDist * maxDist

        const carHalfWidth = vehicle.width / 2
        const carHalfLength = vehicle.length / 2
        const conflictExtraRadius = 3.5
        const conflictPushForce = 8
        const conflictLiftForce = 12

        for (let i = 0; i < count; i++) {
            const ix = i * 3
            const iy = ix + 1
            const iz = ix + 2

            let x = pos[ix]
            let y = pos[iy]
            let z = pos[iz]
            let vx = vel[ix]
            let vy = vel[iy]
            let vz = vel[iz]

            const seed = seeds[i]
            const s = sc[i]

            // Colisão com carro
            const dx = x - vehicle.x
            const dz = z - vehicle.z
            const isInCarZone = Math.abs(dx) < (carHalfWidth + conflictExtraRadius) &&
                Math.abs(dz) < (carHalfLength + conflictExtraRadius)

            if (isInCarZone && vehicle.speed > 0.05) {
                const distToCenterSq = dx * dx + dz * dz
                const distToCenter = Math.sqrt(distToCenterSq)
                const maxDist = Math.sqrt((carHalfWidth + conflictExtraRadius) ** 2 +
                    (carHalfLength + conflictExtraRadius) ** 2)

                const proximity = 1 - Math.min(distToCenter / maxDist, 1)
                const impactStrength = Math.pow(proximity, 1.5)

                const dirX = dx / (distToCenter + 0.001)
                const dirZ = dz / (distToCenter + 0.001)

                const speedFactor = Math.min(vehicle.speed / 10, 1)
                const pushForce = conflictPushForce * impactStrength * speedFactor
                vx += dirX * pushForce * delta * 40
                vz += dirZ * pushForce * delta * 40

                const liftMultiplier = 0.3 + vehicle.speed * 0.15
                const liftForce = conflictLiftForce * impactStrength * liftMultiplier
                vy += liftForce * delta * 40

                vx += vehicle.vx * 0.15
                vz += vehicle.vz * 0.15

                if (impactStrength > 0.7) {
                    vx += (Math.random() - 0.5) * 1.5
                    vz += (Math.random() - 0.5) * 1.5
                    vy += Math.random() * 0.8
                }
            }

            // Vento
            const wind = windBase * Math.sin(t * 0.35 + seed * 0.005) * (1 + Math.cos(seed * 0.07))
            vx += (wind + (Math.random() - 0.5) * windTurb) * delta * 30
            vz += ((Math.random() - 0.5) * windTurb * 0.3) * delta * 30

            // Sustentação
            const horizontalSpeed = Math.sqrt(vx * vx + vz * vz)
            if (y > floorY + 0.05 && horizontalSpeed > 0.5) {
                const liftEffect = Math.min(horizontalSpeed * 0.25, 2.0)
                vy += liftEffect * delta * 25
            }

            // Gravidade
            const gravMult = y > floorY + 1 ? 1.0 : 0.75
            vy += gravity * delta * gravMult * 60

            // Damping
            const dampFactor = y > floorY + 0.1 ?
                Math.pow(airDamping, delta * 60) :
                Math.pow(damping, delta * 60)
            vx *= dampFactor
            vy *= dampFactor
            vz *= dampFactor

            // Limitar velocidade
            const maxVelocity = 8
            const currentSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz)
            if (currentSpeed > maxVelocity) {
                const scale = maxVelocity / currentSpeed
                vx *= scale
                vy *= scale
                vz *= scale
            }

            // Atualizar posição
            x += vx * delta * 60
            y += vy * delta * 60
            z += vz * delta * 60

            // Colisão com chão
            if (y <= floorY) {
                y = floorY
                if (Math.abs(vy) > 0.1) {
                    vy = -vy * bounceFactor
                } else {
                    vy = 0
                }
                vx *= 0.7
                vz *= 0.7
            }

            if (y > 8) {
                y = 8
                vy = Math.min(vy, -1)
            }

            // Respawn quando longe
            const distToCamSq = (x - camPos.x) ** 2 + (z - camPos.z) ** 2
            if (distToCamSq > maxDistSq) {
                const angle = Math.random() * Math.PI * 2
                const dist = 80 + Math.random() * 150
                x = camPos.x + Math.cos(angle) * dist
                z = camPos.z + Math.sin(angle) * dist
                y = floorY
                vx = (Math.random() - 0.5) * 0.02
                vy = 0
                vz = (Math.random() - 0.5) * 0.02
            }

            // Rotação
            let rotY = 0
            let tilt = 0
            let roll = 0

            if (y > floorY + 0.1) {
                const spinSpeed = (x * 0.002 + seed * 0.0001 + t * 0.6) % (Math.PI * 2)
                const heightFactor = Math.min((y - floorY) / 4, 1)
                tilt = Math.cos(spinSpeed * 0.5) * 0.5 * heightFactor
                roll = Math.sin(spinSpeed * 0.8) * 0.7 * heightFactor
                rotY = (x * 0.001 + horizontalSpeed * 0.2 + t * 0.4) % (Math.PI * 2)
            } else {
                rotY = (seed * 0.03) % (Math.PI * 2)
                tilt = Math.sin(seed) * 0.03
                roll = Math.cos(seed * 1.3) * 0.03
            }

            pos[ix] = x
            pos[iy] = y
            pos[iz] = z
            vel[ix] = vx
            vel[iy] = vy
            vel[iz] = vz

            dummy.current.position.set(x, y, z)
            dummy.current.rotation.set(tilt, rotY, roll)
            dummy.current.scale.set(s, 1, s)
            dummy.current.updateMatrix()
            mesh.setMatrixAt(i, dummy.current.matrix)

            // Brilho mais intenso no ar (destaque verde)
            const heightBright = y > floorY + 0.1 ? 1 + Math.min((y - floorY) * 0.2, 0.4) : 1
            const greenGlow = y > floorY + 0.1 ? 0.1 : 0
            tmpColor.current.setRGB(
                Math.min(1, cols[i * 3] * heightBright),
                Math.min(1, cols[i * 3 + 1] * heightBright + greenGlow),
                Math.min(1, cols[i * 3 + 2] * heightBright)
            )
            mesh.setColorAt(i, tmpColor.current)
        }

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[planeGeo, mat, count]} castShadow receiveShadow />
    )
}