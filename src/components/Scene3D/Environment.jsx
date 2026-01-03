import React, { useRef, useMemo, useEffect, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * Environment.jsx - VERSÃO ULTRA OTIMIZADA + VISUAL ESTILO CYBERPUNK
 *
 * 🌃 VISUAL APRIMORADO:
 * - Céu noturno com gradiente azul (escuro → claro)
 * - 1500 estrelas piscando para profundidade
 * - Chão MEGA PIXELADO com manchas escuras tipo ruído
 * - Iluminação azulada cinematográfica
 *
 * 🚀 OTIMIZAÇÕES:
 * - Shadow Map Caching
 * - Frustum Culling Agressivo
 * - Texture Caching
 * - Instanced Rendering
 * - Distance Culling
 */

export default function Environment() {
    const { scene, camera, gl } = useThree()
    const groundRef = useRef()

    // 🌌 Background escuro + neblina azulada
    scene.background = new THREE.Color('#000a1a')

    //fog continua existindo
    scene.fog = new THREE.Fog('#ffffff', 180, 550)

    // 🎯 OTIMIZAÇÃO: Shadow Map Caching
    useEffect(() => {
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        gl.shadowMap.autoUpdate = false // ⚡ Não recalcular sombras todo frame
    }, [gl])

    useFrame(() => {
        if (!groundRef.current) return
        groundRef.current.position.x = Math.floor(camera.position.x / 40) * 40
        groundRef.current.position.z = Math.floor(camera.position.z / 40) * 40
    })

    return (
        <Suspense fallback={null}>
            {/* ✨ ILUMINAÇÃO CINEMATOGRÁFICA AZUL */}
            <ambientLight intensity={0.45} color="#4a5f8c" />

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

            <directionalLight
                position={[-40, 30, -30]}
                intensity={0.6}
                color="#7aa3d6"
            />

            <hemisphereLight
                skyColor="#3d5a80"
                groundColor="#1a2332"
                intensity={0.7}
            />

            <pointLight
                position={[0, 15, 0]}
                intensity={0.5}
                color="#6a8caf"
                distance={100}
                decay={2}
            />

            {/* 🎮 CHÃO MEGA PIXELADO */}
            <group ref={groundRef}>
                <PixelatedGround />
            </group>

            {/* 🌟 ESTRELAS NO CÉU (profundidade) */}
            <Stars />

            {/* 🌌 GRADIENTE DO CÉU (atmosfera) */}
            <SkyGradient />

            {/* 🍃 SISTEMA DE FOLHAS */}
            <LeavesField
                count={30000}
                spread={425}
                floorY={0.01}
                camera={camera}
            />

            {/* 🌟 POST-PROCESSING COM BLOOM */}
            <EffectComposer>
                <Bloom
                    intensity={2.2}
                    luminanceThreshold={0.15}
                    luminanceSmoothing={1}
                    radius={0.8}
                />
            </EffectComposer>
        </Suspense>
    )
}

/* ======================
   CHÃO MEGA PIXELADO COM MANCHAS
   ====================== */
function PixelatedGround() {
    // 🎯 CACHE: Textura criada 1x e reutilizada
    const texture = useMemo(() => {
        const size = 512
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        // Base escura
        ctx.fillStyle = '#1a2838'
        ctx.fillRect(0, 0, size, size)

        // 🎮 PIXELS PEQUENOS tipo ruído (manchas escuras)
        const pixelSize = 6 // Bem pequeno para efeito de ruído
        const cols = size / pixelSize
        const rows = size / pixelSize

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // 45% de chance de ter uma mancha
                if (Math.random() < 0.45) {
                    // Variação de escuridão
                    const darkness = Math.random() * 0.5 + 0.2
                    const r = parseInt('1a', 16) * (1 - darkness)
                    const g = parseInt('28', 16) * (1 - darkness)
                    const b = parseInt('38', 16) * (1 - darkness)

                    ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
                }
            }
        }

        // Adiciona alguns pixels mais claros (detalhes)
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * cols) * pixelSize
            const y = Math.floor(Math.random() * rows) * pixelSize
            const brightness = Math.random() * 0.3 + 0.1

            const r = parseInt('1a', 16) * (1 + brightness)
            const g = parseInt('28', 16) * (1 + brightness)
            const b = parseInt('38', 16) * (1 + brightness)

            ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
            ctx.fillRect(x, y, pixelSize, pixelSize)
        }

        const tex = new THREE.CanvasTexture(canvas)
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(20, 20) // Muitas repetições = efeito de ruído

        // 🎯 OTIMIZAÇÃO: Nearest filter = sem interpolação = visual pixelado
        tex.magFilter = THREE.NearestFilter
        tex.minFilter = THREE.NearestFilter

        return tex
    }, [])

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1400, 1400]} />
            <meshStandardMaterial
                map={texture}
                roughness={0.9}
                metalness={0.1}
                emissive="#0a1520"
                emissiveIntensity={0.2}
            />
        </mesh>
    )
}

/* ======================
   ESTRELAS PISCANDO (profundidade)
   ====================== */
function Stars() {
    const meshRef = useRef()
    const starsCount = 1800

    const { positions, sizes, twinkleSeeds } = useMemo(() => {
        const pos = new Float32Array(starsCount * 3)
        const siz = new Float32Array(starsCount)
        const seeds = new Float32Array(starsCount)

        for (let i = 0; i < starsCount; i++) {
            // Distribuir em uma esfera ao redor da cena
            const radius = 380 + Math.random() * 220
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(Math.random() * 0.7 - 0.15) // Mais estrelas acima

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = radius * Math.cos(phi)
            pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

            siz[i] = Math.random() * 2.5 + 0.4
            seeds[i] = Math.random() * 1000
        }

        return { positions: pos, sizes: siz, twinkleSeeds: seeds }
    }, [])

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
        geo.setAttribute('seed', new THREE.BufferAttribute(twinkleSeeds, 1))
        return geo
    }, [positions, sizes, twinkleSeeds])

    // Material com shader customizado para piscar
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color('#ffffff') }
            },
            vertexShader: `
                attribute float size;
                attribute float seed;
                varying float vOpacity;
                uniform float time;
                
                void main() {
                    // Piscar baseado no seed único de cada estrela
                    float twinkle = sin(time * 2.0 + seed * 10.0) * 0.5 + 0.5;
                    vOpacity = 0.3 + twinkle * 0.7;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                varying float vOpacity;
                
                void main() {
                    // Forma circular suave
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;
                    
                    float alpha = (1.0 - dist * 2.0) * vOpacity;
                    gl_FragColor = vec4(baseColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            fog: false
        })
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return
        // Atualiza tempo para piscar
        material.uniforms.time.value = state.clock.elapsedTime
        // Rotação sutil das estrelas
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.008
    })

    return <points ref={meshRef} geometry={geometry} material={material} />
}

/* ======================
   GRADIENTE DO CÉU (atmosfera)
   ====================== */
function SkyGradient() {
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            fog: false,
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vWorldPosition;
                void main() {
                    // Gradiente baseado na altura (normalizado)
                    float h = normalize(vWorldPosition).y;
                    
                    // Cores do gradiente (azul escuro → azul médio → azul claro com toque roxo)
                    vec3 bottomColor = vec3(0.00001, 0.0005, 0.0003); // #0a1428 (azul muito escuro)
                    vec3 middleColor = vec3(0.0001, 0.00002, 0.0008);   // Azul médio
                    vec3 topColor = vec3(0.005, 0.005, 0.02);     // Azul mais claro com toque roxo
                    
                    vec3 skyColor;
                    if (h < 0.0) {
                        // Abaixo do horizonte - transição suave
                        skyColor = mix(bottomColor, middleColor, (h + 1.0));
                    } else {
                        // Acima do horizonte - gradiente mais sutil
                        skyColor = mix(middleColor, topColor, pow(h, 0.8));
                    }
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `
        })
    }, [])

    return (
        <mesh>
            <sphereGeometry args={[850, 32, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

/* ======================
   LeavesField - Sistema de física das folhas
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
    const sparklePhaseRef = useRef(null)
    const rotationSpeedsRef = useRef(null)

    const dummy = useRef(new THREE.Object3D())
    const tmpColor = useRef(new THREE.Color())

    // Geometria plana compartilhada
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
            color: '#7fd68a',
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.DoubleSide,
            transparent: true,
            vertexColors: true,
            opacity: 0.65,
            emissive: '#4ade80',
            emissiveIntensity: 1.2,
            alphaTest: 0.1,
        })
    }, [])

    useEffect(() => {
        const pos = new Float32Array(count * 3)
        const vel = new Float32Array(count * 3)
        const sc = new Float32Array(count)
        const cols = new Float32Array(count * 3)
        const seeds = new Float32Array(count)
        const sparklePhases = new Float32Array(count)
        const rotationSpeeds = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * spread
            pos[i * 3 + 1] = floorY
            pos[i * 3 + 2] = (Math.random() - 0.5) * spread

            vel[i * 3] = (Math.random() - 0.5) * 0.005
            vel[i * 3 + 1] = 0
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005

            sc[i] = 0.2 + Math.random() * 0.4

            const rand = Math.random()
            let hue, sat, light

            if (rand < 0.5) {
                hue = 0.28 + Math.random() * 0.12
                sat = 0.6 + Math.random() * 0.3
                light = 0.55 + Math.random() * 0.25
            } else if (rand < 0.75) {
                hue = 0.22 + Math.random() * 0.08
                sat = 0.65 + Math.random() * 0.25
                light = 0.6 + Math.random() * 0.2
            } else {
                hue = 0.18 + Math.random() * 0.1
                sat = 0.55 + Math.random() * 0.3
                light = 0.65 + Math.random() * 0.2
            }

            const c = new THREE.Color()
            c.setHSL(hue, sat, light)
            cols[i * 3] = c.r
            cols[i * 3 + 1] = c.g
            cols[i * 3 + 2] = c.b

            seeds[i] = Math.random() * 1000
            sparklePhases[i] = Math.random() * Math.PI * 2

            rotationSpeeds[i * 3] = (Math.random() - 0.5) * 2.5
            rotationSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 3.0
            rotationSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 2.0
        }

        positionsRef.current = pos
        velocitiesRef.current = vel
        scalesRef.current = sc
        colorsRef.current = cols
        seedsRef.current = seeds
        sparklePhaseRef.current = sparklePhases
        rotationSpeedsRef.current = rotationSpeeds

        if (meshRef.current) {
            const mesh = meshRef.current
            for (let i = 0; i < count; i++) {
                const x = pos[i * 3]
                const y = pos[i * 3 + 1]
                const z = pos[i * 3 + 2]
                const s = sc[i]

                const rotX = Math.random() * Math.PI * 2
                const rotY = Math.random() * Math.PI * 2
                const rotZ = Math.random() * Math.PI * 2

                dummy.current.position.set(x, y, z)
                dummy.current.rotation.set(rotX, rotY, rotZ)
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

    useFrame((state, delta) => {
        if (!meshRef.current || !positionsRef.current) return

        const t = state.clock.getElapsedTime()
        const pos = positionsRef.current
        const vel = velocitiesRef.current
        const sc = scalesRef.current
        const cols = colorsRef.current
        const seeds = seedsRef.current
        const sparklePhases = sparklePhaseRef.current
        const rotSpeeds = rotationSpeedsRef.current
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

        const maxDist = 400
        const maxDistSq = maxDist * maxDist
        const updateDist = 300
        const updateDistSq = updateDist * updateDist

        const carHalfWidth = vehicle.width / 2
        const carHalfLength = vehicle.length / 2
        const conflictExtraRadius = 3.5
        const conflictPushForce = 8
        const conflictLiftForce = 12

        let needsMatrixUpdate = false
        let needsColorUpdate = false

        for (let i = 0; i < count; i++) {
            const ix = i * 3
            const iy = ix + 1
            const iz = ix + 2

            let x = pos[ix]
            let y = pos[iy]
            let z = pos[iz]

            const distToCamSq = (x - camPos.x) ** 2 + (z - camPos.z) ** 2

            if (distToCamSq > updateDistSq && distToCamSq < maxDistSq) {
                continue
            }

            let vx = vel[ix]
            let vy = vel[iy]
            let vz = vel[iz]

            const seed = seeds[i]
            const s = sc[i]

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

            const wind = windBase * Math.sin(t * 0.35 + seed * 0.005) * (1 + Math.cos(seed * 0.07))
            const windX = wind + (Math.random() - 0.5) * windTurb
            const windZ = Math.sin(t * 0.42 + seed * 0.008) * windBase * 0.8 + (Math.random() - 0.5) * windTurb

            const gustPhase = Math.sin(t * 0.15) * 0.5 + 0.5
            const gustStrength = gustPhase * 0.4

            vx += (windX + gustStrength * Math.cos(t * 0.3 + seed)) * delta * 30
            vz += (windZ + gustStrength * Math.sin(t * 0.25 + seed * 0.5)) * delta * 30

            const horizontalSpeed = Math.sqrt(vx * vx + vz * vz)

            if (y > floorY + 0.05 && horizontalSpeed > 0.3) {
                const liftEffect = Math.min(horizontalSpeed * 0.35, 2.5)
                vy += liftEffect * delta * 25

                const driftX = Math.sin(t * 0.5 + seed * 0.1) * 0.08
                const driftZ = Math.cos(t * 0.4 + seed * 0.15) * 0.08
                vx += driftX * delta * 30
                vz += driftZ * delta * 30
            }

            const gravMult = y > floorY + 1 ? 1.0 : 0.75
            vy += gravity * delta * gravMult * 60

            const horizontalDampFactor = y > floorY + 0.1 ?
                Math.pow(airDamping, delta * 60) :
                Math.pow(damping, delta * 60)

            const verticalDampFactor = y > floorY + 0.1 ?
                Math.pow(airDamping * 1.5, delta * 60) :
                Math.pow(damping * 1.3, delta * 60)

            vx *= horizontalDampFactor
            vy *= verticalDampFactor
            vz *= horizontalDampFactor

            const maxVelocity = 8
            const currentSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz)
            if (currentSpeed > maxVelocity) {
                const scale = maxVelocity / currentSpeed
                vx *= scale
                vy *= scale
                vz *= scale
            }

            x += vx * delta * 60
            y += vy * delta * 60
            z += vz * delta * 60

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

            let rotX = 0
            let rotY = 0
            let rotZ = 0

            if (y > floorY + 0.1) {
                const heightFactor = Math.min((y - floorY) / 4, 1)

                const baseRotX = rotSpeeds[i * 3]
                const baseRotY = rotSpeeds[i * 3 + 1]
                const baseRotZ = rotSpeeds[i * 3 + 2]

                const velocityMagnitude = Math.sqrt(vx * vx + vy * vy + vz * vz)
                const spinFactor = velocityMagnitude * 0.5 + 0.3

                rotX = (baseRotX * t * spinFactor + seed * 0.1) % (Math.PI * 2)
                rotY = (baseRotY * t * spinFactor + seed * 0.2) % (Math.PI * 2)
                rotZ = (baseRotZ * t * spinFactor + seed * 0.15) % (Math.PI * 2)

                const oscillation = Math.sin(t * 3 + seed * 0.05) * 0.4 * heightFactor
                rotX += oscillation * Math.cos(seed)
                rotZ += oscillation * Math.sin(seed * 1.3)

                const windTorque = (vx * 0.3 + vz * 0.2) * heightFactor
                rotY += windTorque

                if (Math.random() < 0.01) {
                    rotX += (Math.random() - 0.5) * 0.5
                    rotZ += (Math.random() - 0.5) * 0.5
                }

                if (Math.random() < 0.02) {
                    vx += (Math.random() - 0.5) * 0.3
                    vz += (Math.random() - 0.5) * 0.3

                    rotSpeeds[i * 3] += (Math.random() - 0.5) * 0.3
                    rotSpeeds[i * 3 + 2] += (Math.random() - 0.5) * 0.2
                }

            } else {
                rotX = Math.sin(seed) * 0.15 + Math.sin(t * 0.2 + seed) * 0.05
                rotY = (seed * 0.5) % (Math.PI * 2)
                rotZ = Math.cos(seed * 1.3) * 0.15 + Math.cos(t * 0.15 + seed * 0.5) * 0.05

                rotSpeeds[i * 3] *= 0.95
                rotSpeeds[i * 3 + 1] *= 0.95
                rotSpeeds[i * 3 + 2] *= 0.95
            }

            pos[ix] = x
            pos[iy] = y
            pos[iz] = z
            vel[ix] = vx
            vel[iy] = vy
            vel[iz] = vz

            dummy.current.position.set(x, y, z)
            dummy.current.rotation.set(rotX, rotY, rotZ)
            dummy.current.scale.set(s, 1, s)
            dummy.current.updateMatrix()
            mesh.setMatrixAt(i, dummy.current.matrix)
            needsMatrixUpdate = true

            const isAirborne = y > floorY + 0.2

            const leftHeadlight = new THREE.Vector3(vehicle.x - 0.7, 1, vehicle.z + 1.5)
            const rightHeadlight = new THREE.Vector3(vehicle.x + 0.4, 1, vehicle.z + 1.5)

            const distToLeftLight = Math.sqrt(
                (x - leftHeadlight.x) ** 2 +
                (y - leftHeadlight.y) ** 2 +
                (z - leftHeadlight.z) ** 2
            )
            const distToRightLight = Math.sqrt(
                (x - rightHeadlight.x) ** 2 +
                (y - rightHeadlight.y) ** 2 +
                (z - rightHeadlight.z) ** 2
            )

            const lightRange = 30
            const leftLightInfluence = Math.max(0, 1 - distToLeftLight / lightRange)
            const rightLightInfluence = Math.max(0, 1 - distToRightLight / lightRange)
            const headlightInfluence = Math.max(leftLightInfluence, rightLightInfluence)

            const headlightBoost = Math.pow(headlightInfluence, 0.6) * 6.0

            if (isAirborne) {
                const sparkleFreq = 7 + seed * 0.01
                const sparkleWave = Math.sin(t * sparkleFreq + sparklePhases[i])
                const sparkleIntensity = sparkleWave * 0.5 + 1.2

                const heightBoost = 1.5 + Math.min((y - floorY) * 0.4, 1.0)

                const megaFlash = Math.random() < 0.03 ? 1.2 : 0

                const totalBrightness = heightBoost * sparkleIntensity + megaFlash + headlightBoost

                const colorPulse = Math.sin(t * 4 + seed * 0.1) * 0.5 + 0.5
                const hueShift = colorPulse * 0.2

                const yellowTint = headlightInfluence * 0.6

                tmpColor.current.setRGB(
                    Math.min(1, cols[i * 3] * totalBrightness + sparkleIntensity * 0.4 + hueShift * 0.3 + yellowTint),
                    Math.min(1, cols[i * 3 + 1] * totalBrightness + sparkleIntensity * 0.6 + hueShift * 0.4 + yellowTint * 0.8),
                    Math.min(1, cols[i * 3 + 2] * totalBrightness + sparkleIntensity * 0.3 + yellowTint * 0.3)
                )
            } else {
                const groundPulse = Math.sin(t * 2.5 + seed * 0.05) * 0.3 + 1.0
                const totalGroundBrightness = groundPulse + headlightBoost

                const yellowTint = headlightInfluence * 0.8

                tmpColor.current.setRGB(
                    Math.min(1, cols[i * 3] * totalGroundBrightness + yellowTint),
                    Math.min(1, cols[i * 3 + 1] * totalGroundBrightness + yellowTint * 0.9),
                    Math.min(1, cols[i * 3 + 2] * totalGroundBrightness + yellowTint * 0.4)
                )
            }

            mesh.setColorAt(i, tmpColor.current)
            needsColorUpdate = true
        }

        if (needsMatrixUpdate) mesh.instanceMatrix.needsUpdate = true
        if (needsColorUpdate && mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })

    return (
        <instancedMesh
            ref={meshRef}
            args={[planeGeo, mat, count]}
            castShadow
            receiveShadow
            frustumCulled={true}
        />
    )
}