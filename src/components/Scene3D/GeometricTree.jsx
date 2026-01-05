import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * GeometricTree.jsx
 *
 * 🌳 Árvore pixelada mágica otimizada (night/mystical variant)
 * - Copa mais densa e orgânica
 * - Brilho circular girando com variação aleatória
 * - Paleta rica: azuis profundos, cianos luminosos, toques de roxo
 * - Frutos/flores bioluminescentes raros
 * - Galhos secundários e raízes aparentes
 * - Grama com flores ocasionais
 * - Random determinístico por árvore (seed pelo position)
 * - Mantém poucas draw calls (InstancedMesh)
 * - Sistema de toggle on/off
 */

/* =======================
   GEOMETRIAS COMPARTILHADAS
======================= */

const LEAF_GEOMETRY = new THREE.BoxGeometry(0.55, 0.55, 0.55)
const TRUNK_GEOMETRY = new THREE.CylinderGeometry(0.5, 0.7, 6.5, 6, 1)
const GRASS_GEOMETRY = new THREE.PlaneGeometry(0.35, 0.7)
const BLOOM_GEOMETRY = new THREE.SphereGeometry(0.3, 6, 6)
const BRANCH_GEOMETRY = new THREE.CylinderGeometry(0.15, 0.2, 2, 6)
const ROOT_GEOMETRY = new THREE.CylinderGeometry(0.35, 0.45, 1.5, 6)

/* =======================
   MATERIAIS COMPARTILHADOS
======================= */

const LEAF_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    emissive: 0x0a3d5c,
    emissiveIntensity: 0.15,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.95
})

const BLOOM_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    emissive: 0x4fc3f7,
    emissiveIntensity: 0.8,
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9
})

const TRUNK_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x5a3420,
    roughness: 1.0,
    metalness: 0.0
})

const BRANCH_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x6a3f2a,
    roughness: 1.0,
    metalness: 0.0
})

const ROOT_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x4a2818,
    roughness: 1.0,
    metalness: 0.0
})

const GRASS_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
})

/* =======================
   RNG DETERMINÍSTICO (seeded)
======================= */

function mulberry32(seed) {
    let t = seed >>> 0
    return function () {
        t += 0x6d2b79f5
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
}

function hashPositionToSeed(position) {
    const [x, y, z] = position
    const sx = Math.floor((x + 1000) * 10)
    const sy = Math.floor((y + 1000) * 10)
    const sz = Math.floor((z + 1000) * 10)
    let seed = 2166136261
    seed ^= sx + 0x9e3779b9 + (seed << 6) + (seed >> 2)
    seed ^= sy + 0x9e3779b9 + (seed << 6) + (seed >> 2)
    seed ^= sz + 0x9e3779b9 + (seed << 6) + (seed >> 2)
    return seed >>> 0
}

/* =======================
   COMPONENTE TREE
======================= */

function Tree({ position, enabled = true }) {
    const leavesRef = useRef()
    const trunkRef = useRef()
    const grassRef = useRef()
    const bloomRef = useRef()
    const branchesRef = useRef()
    const rootsRef = useRef()

    const {
        leafMatrices,
        leafColors,
        leafBaseColors,
        leafAngles,
        leafPhases,
        grassMatrices,
        grassColors,
        bloomMatrices,
        bloomColors,
        branchMatrices,
        rootMatrices
    } = useMemo(() => {
        const seed = hashPositionToSeed(position)
        const rnd = mulberry32(seed)

        const leafMatrices = []
        const leafColors = []
        const leafBaseColors = []
        const leafAngles = []
        const leafPhases = []
        const grassMatrices = []
        const grassColors = []
        const bloomMatrices = []
        const bloomColors = []
        const branchMatrices = []
        const rootMatrices = []

        const dummy = new THREE.Object3D()

        /* ===== COPA DA ÁRVORE (mais densa e orgânica) ===== */
        const layers = 10
        const blocksPerLayer = 75
        const baseRadius = 7.8
        const baseHeight = 6.15

        for (let layer = 0; layer < layers; layer++) {
            const progress = layer / (layers - 1)

            let radiusMultiplier
            if (progress < 0.3) {
                radiusMultiplier = 1.0 - progress * 0.4
            } else if (progress < 0.6) {
                radiusMultiplier = 0.7 - (progress - 0.3) * 0.3
            } else {
                radiusMultiplier = 0.55 + Math.sin((progress - 0.6) * Math.PI / 0.4 * 0.5) * 0.5
            }

            const radius = baseRadius * radiusMultiplier
            const height = baseHeight + layer * 0.95

            for (let i = 0; i < blocksPerLayer; i++) {
                if (rnd() < 0.10) continue

                const angle = (Math.PI * 2 * i) / blocksPerLayer + rnd() * 0.3
                const r = radius * (0.65 + rnd() * 0.50)

                const waviness = Math.sin(angle * 3) * 0.3 + Math.cos(angle * 5) * 0.2

                dummy.position.set(
                    Math.cos(angle) * (r + waviness),
                    height + (rnd() - 0.5) * 0.7,
                    Math.sin(angle) * (r + waviness)
                )

                dummy.rotation.set(0, rnd() * Math.PI * 2, 0)

                const scale = 0.62 + rnd() * 0.42
                dummy.scale.setScalar(scale)

                dummy.updateMatrix()
                leafMatrices.push(dummy.matrix.clone())

                const ax = dummy.position.x
                const az = dummy.position.z
                leafAngles.push(Math.atan2(az, ax))
                leafPhases.push(rnd() * Math.PI * 2)

                let h, s, l
                if (rnd() < 0.85) {
                    h = 0.54 + (rnd() - 0.5) * 0.08
                    s = 0.55 + (rnd() - 0.5) * 0.15
                    l = (0.18 + progress * 0.12) + (rnd() - 0.5) * 0.04
                } else {
                    h = 0.70 + (rnd() - 0.5) * 0.06
                    s = 0.45 + (rnd() - 0.5) * 0.10
                    l = 0.20 + progress * 0.08
                }

                const baseColor = new THREE.Color().setHSL(h, s, THREE.MathUtils.clamp(l, 0.08, 0.40))
                leafColors.push(baseColor.clone())
                leafBaseColors.push(baseColor.clone())

                if (rnd() < 0.05 && layer > 2) {
                    dummy.position.y += 0.3
                    dummy.scale.setScalar(0.5 + rnd() * 0.3)
                    dummy.updateMatrix()
                    bloomMatrices.push(dummy.matrix.clone())

                    const bh = 0.52 + (rnd() - 0.5) * 0.10
                    const bs = 0.70 + rnd() * 0.25
                    const bl = 0.60 + rnd() * 0.25
                    bloomColors.push(new THREE.Color().setHSL(bh, bs, bl))
                }
            }
        }

        /* ===== GALHOS SECUNDÁRIOS ===== */
        const branchCount = 6
        for (let i = 0; i < branchCount; i++) {
            const angle = (Math.PI * 2 * i) / branchCount + rnd() * 0.5
            const branchHeight = 4 + rnd() * 3

            dummy.position.set(
                Math.cos(angle) * 1.5,
                branchHeight,
                Math.sin(angle) * 1.5
            )

            dummy.rotation.set(
                Math.PI / 2 + (rnd() - 0.5) * 0.3,
                angle,
                (rnd() - 0.5) * 0.2
            )

            const branchScale = 0.7 + rnd() * 0.4
            dummy.scale.set(branchScale, 1, branchScale)

            dummy.updateMatrix()
            branchMatrices.push(dummy.matrix.clone())
        }

        /* ===== RAÍZES APARENTES ===== */
        const rootCount = 5
        for (let i = 0; i < rootCount; i++) {
            const angle = (Math.PI * 2 * i) / rootCount + rnd() * 0.4

            dummy.position.set(
                Math.cos(angle) * 1.2,
                0.5,
                Math.sin(angle) * 1.2
            )

            dummy.rotation.set(
                (rnd() - 0.5) * 0.4,
                angle,
                0
            )

            const rootScale = 0.8 + rnd() * 0.3
            dummy.scale.set(rootScale, 0.8, rootScale)

            dummy.updateMatrix()
            rootMatrices.push(dummy.matrix.clone())
        }

        /* ===== GRAMA AO REDOR (com flores ocasionais) ===== */
        const grassCount = 85
        const grassRadius = 9.5

        for (let i = 0; i < grassCount; i++) {
            const angle = rnd() * Math.PI * 2
            const distance = Math.pow(rnd(), 0.75) * grassRadius

            dummy.position.set(
                Math.cos(angle) * distance,
                0.35,
                Math.sin(angle) * distance
            )

            dummy.rotation.set(
                (rnd() * 0.30 - 0.15),
                angle + (rnd() - 0.5) * 0.25,
                0
            )

            const scale = 0.58 + rnd() * 0.55
            dummy.scale.set(scale, scale * (1.15 + rnd() * 0.25), scale)

            dummy.updateMatrix()
            grassMatrices.push(dummy.matrix.clone())

            let gh, gs, gl
            if (rnd() < 0.92) {
                gh = 0.40 + (rnd() - 0.5) * 0.05
                gs = 0.38 + (rnd() - 0.5) * 0.12
                gl = 0.14 + (rnd() - 0.5) * 0.05
            } else {
                gh = 0.52 + (rnd() - 0.5) * 0.10
                gs = 0.60 + rnd() * 0.25
                gl = 0.35 + rnd() * 0.20
            }
            grassColors.push(new THREE.Color().setHSL(gh, gs, THREE.MathUtils.clamp(gl, 0.06, 0.65)))
        }

        return {
            leafMatrices,
            leafColors,
            leafBaseColors,
            leafAngles,
            leafPhases,
            grassMatrices,
            grassColors,
            bloomMatrices,
            bloomColors,
            branchMatrices,
            rootMatrices
        }
    }, [position])

    /* ===== APLICA MATRIZES + CORES ===== */
    useEffect(() => {
        if (!leavesRef.current || !grassRef.current) return

        leafMatrices.forEach((m, i) => {
            leavesRef.current.setMatrixAt(i, m)
            leavesRef.current.setColorAt(i, leafColors[i])
        })
        leavesRef.current.instanceMatrix.needsUpdate = true
        leavesRef.current.instanceColor.needsUpdate = true
        leavesRef.current.material.needsUpdate = true

        grassMatrices.forEach((m, i) => {
            grassRef.current.setMatrixAt(i, m)
            grassRef.current.setColorAt(i, grassColors[i])
        })
        grassRef.current.instanceMatrix.needsUpdate = true
        grassRef.current.instanceColor.needsUpdate = true
        grassRef.current.material.needsUpdate = true

        if (bloomRef.current && bloomMatrices.length > 0) {
            bloomMatrices.forEach((m, i) => {
                bloomRef.current.setMatrixAt(i, m)
                bloomRef.current.setColorAt(i, bloomColors[i])
            })
            bloomRef.current.instanceMatrix.needsUpdate = true
            bloomRef.current.instanceColor.needsUpdate = true
            bloomRef.current.material.needsUpdate = true
        }

        if (branchesRef.current && branchMatrices.length > 0) {
            branchMatrices.forEach((m, i) => {
                branchesRef.current.setMatrixAt(i, m)
            })
            branchesRef.current.instanceMatrix.needsUpdate = true
        }

        if (rootsRef.current && rootMatrices.length > 0) {
            rootMatrices.forEach((m, i) => {
                rootsRef.current.setMatrixAt(i, m)
            })
            rootsRef.current.instanceMatrix.needsUpdate = true
        }
    }, [leafMatrices, leafColors, grassMatrices, grassColors, bloomMatrices, bloomColors, branchMatrices, rootMatrices])

    /* ===== ANIMAÇÃO COM BRILHO CIRCULAR GIRANDO ===== */
    const animate = useCallback((state) => {
        if (!enabled) return // Para a animação quando desativado

        const t = state.clock.elapsedTime

        const tmp = new THREE.Color()
        const glowColor = new THREE.Color(0x8fe9ff)

        function wrapAngle(a) {
            return Math.atan2(Math.sin(a), Math.cos(a))
        }

        if (leavesRef.current) {
            const speed = 0.35
            const sigma = 0.55
            const ringAngle = t * speed

            for (let i = 0; i < leafBaseColors.length; i++) {
                const diff = wrapAngle(leafAngles[i] - ringAngle)
                const ring = Math.exp(-(diff * diff) / (2 * sigma * sigma)) * 0.35
                const sparkle = (Math.sin(t * 1.3 + leafPhases[i]) * 0.5 + 0.5) * 0.18
                const k = THREE.MathUtils.clamp(ring + sparkle, 0, 0.55)

                tmp.copy(leafBaseColors[i]).lerp(glowColor, k)
                tmp.offsetHSL(0, 0, k * 0.10)

                leavesRef.current.setColorAt(i, tmp)
            }

            leavesRef.current.instanceColor.needsUpdate = true

            const r = 0.12
            leavesRef.current.position.x = Math.cos(t * 0.22) * r
            leavesRef.current.position.z = Math.sin(t * 0.22) * r
            leavesRef.current.position.y = Math.sin(t * 0.25) * 0.08
            leavesRef.current.rotation.y = Math.sin(t * 0.12) * 0.03
        }

        if (bloomRef.current) {
            const pulse = 1 + Math.sin(t * 2) * 0.15
            bloomRef.current.scale.setScalar(pulse)
        }

        if (grassRef.current) {
            grassRef.current.rotation.y = Math.sin(t * 0.4) * 0.05
        }

        if (trunkRef.current) {
            trunkRef.current.rotation.z = Math.sin(t * 0.22) * 0.012
        }

        if (branchesRef.current) {
            branchesRef.current.rotation.y = Math.sin(t * 0.25) * 0.02
        }
    }, [leafBaseColors, leafAngles, leafPhases, enabled])

    useFrame(animate)

    return (
        <group position={position} visible={enabled}>
            {/* Raízes */}
            {rootMatrices.length > 0 && (
                <instancedMesh
                    ref={rootsRef}
                    args={[ROOT_GEOMETRY, ROOT_MATERIAL, rootMatrices.length]}
                    frustumCulled
                />
            )}

            {/* Tronco */}
            <mesh
                ref={trunkRef}
                geometry={TRUNK_GEOMETRY}
                material={TRUNK_MATERIAL}
                position={[0, 3.25, 0]}
            />

            {/* Galhos */}
            {branchMatrices.length > 0 && (
                <instancedMesh
                    ref={branchesRef}
                    args={[BRANCH_GEOMETRY, BRANCH_MATERIAL, branchMatrices.length]}
                    frustumCulled
                />
            )}

            {/* Folhas */}
            <instancedMesh
                ref={leavesRef}
                args={[LEAF_GEOMETRY, LEAF_MATERIAL, leafMatrices.length]}
                frustumCulled
            />

            {/* Flores/Frutos Bioluminescentes */}
            {bloomMatrices.length > 0 && (
                <instancedMesh
                    ref={bloomRef}
                    args={[BLOOM_GEOMETRY, BLOOM_MATERIAL, bloomMatrices.length]}
                    frustumCulled
                />
            )}

            {/* Grama */}
            <instancedMesh
                ref={grassRef}
                args={[GRASS_GEOMETRY, GRASS_MATERIAL, grassMatrices.length]}
                frustumCulled
            />
        </group>
    )
}

/* =======================
   CLUSTERS DE ÁRVORES
======================= */

export default function TreeClusters({ enabled = true }) {
    const positions = useMemo(
        () => [
            [-45, 0, -100],
            [-38, 0, -85],
            [-52, 0, -55],
            [-44, 0, -30],
            [-58, 0, 0],
            [-46, 0, 30],
            [-60, 0, 65],

            [45, 0, -100],
            [38, 0, -85],
            [52, 0, -55],
            [44, 0, -30],
            [58, 0, 0],
            [46, 0, 30],
            [60, 0, 65]
        ],
        []
    )

    return (
        <>
            {positions.map((p, i) => (
                <Tree key={i} position={p} enabled={enabled} />
            ))}
        </>
    )
}
