import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Fireflies.jsx - Efeito de Vagalumes Brilhantes
 *
 * 🔥 CARACTERÍSTICAS:
 * - Movimento flutuante suave e orgânico
 * - Piscar realista com shader customizado
 * - Brilho intenso com Additive Blending
 * - FIXOS NO AMBIENTE (não seguem a câmera)
 * - Visual pixelado e baixinho
 */

export default function Fireflies({ count = 150, spread = 400 }) {
    const meshRef = useRef()

    const { positions, sizes, speeds, phases } = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const siz = new Float32Array(count)
        const spd = new Float32Array(count)
        const phs = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // ⚡ Distribuir vagalumes fixos no ambiente
            pos[i * 3] = (Math.random() - 0.5) * spread // X aleatório
            pos[i * 3 + 1] = Math.random() * 8 + 0.5 // Altura: entre 0.5 e 8.5
            pos[i * 3 + 2] = (Math.random() - 0.5) * spread // Z aleatório

            siz[i] = Math.random() * 2 + 0.8
            spd[i] = 0.3 + Math.random() * 0.8
            phs[i] = Math.random() * Math.PI * 2
        }

        return { positions: pos, sizes: siz, speeds: spd, phases: phs }
    }, [count, spread])

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
        geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1))
        geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
        return geo
    }, [positions, sizes, speeds, phases])

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color('#acefb9') }
            },
            vertexShader: `
                attribute float size;
                attribute float speed;
                attribute float phase;
                varying float vIntensity;
                uniform float time;
                
                void main() {
                    // Movimento flutuante suave (mais sutil)
                    vec3 pos = position;
                    pos.y += sin(time * speed + phase) * 0.8;
                    pos.x += cos(time * speed * 0.7 + phase) * 1.0;
                    pos.z += sin(time * speed * 0.5 + phase * 1.3) * 1.0;
                    
                    // Piscar suave baseado no tempo
                    float blink = sin(time * 2.5 + phase * 10.0) * 0.5 + 0.5;
                    vIntensity = pow(blink, 2.0);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    gl_PointSize = size * (100.0 / -mvPosition.z) * (0.6 + vIntensity * 0.4);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float vIntensity;
                
                void main() {
                    // EFEITO PIXELADO: dividir em grid
                    vec2 pixelCoord = gl_PointCoord * 6.0; // 6x6 grid
                    vec2 pixelCenter = floor(pixelCoord) + 0.5;
                    pixelCenter /= 6.0;
                    
                    // Calcular distância do centro do pixel
                    vec2 center = pixelCenter - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.45) discard;
                    
                    // Brilho mais duro (menos suave = mais pixelado)
                    float glow = 1.0 - dist * 2.2;
                    glow = pow(glow, 1.5);
                    
                    // Aplicar intensidade de piscar
                    float finalIntensity = glow * vIntensity * 1.8;
                    
                    // Cor amarela brilhante com alpha
                    vec3 finalColor = glowColor * finalIntensity;
                    float alpha = finalIntensity * 0.85;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false
        })
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.elapsedTime
        material.uniforms.time.value = time

        // ⚡ REMOVIDO: não atualiza mais as posições!
        // Agora os vagalumes ficam fixos no ambiente
    })

    return <points ref={meshRef} geometry={geometry} material={material} />
}
