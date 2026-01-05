// src/components/Scene3D/Lake.jsx
import React, { useRef, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const Lake = forwardRef(({
                             lakeCount = 125,
                             minSize = 3,
                             maxSize = 8,
                             visible = true,
                             floorY = 0.02, // Levemente acima do chão para evitar z-fighting
                             reflectivity = 0.95, // Poças são quase espelhos
                             spread = 20
                         }, ref) => {
    const groupRef = useRef()
    const { camera } = useThree()

    const lakesData = useMemo(() => {
        const data = []
        const pathLength = spread
        const pathWidth = spread * 0.15

        for (let i = 0; i < lakeCount; i++) {
            const z = (i / lakeCount) * pathLength - pathLength / 2
            const side = Math.random() > 0.5 ? 1 : -1
            const xOffset = Math.pow(Math.random(), 1.6) * pathWidth / 2
            const x = side * (8 + xOffset)

            // Poças costumam ser mais achatadas/alongadas
            const size = minSize + Math.random() * (maxSize - minSize)
            const scaleX = 1 + Math.random() * 0.5
            const scaleZ = 1 + Math.random() * 0.5

            const rotation = Math.random() * Math.PI * 2
            const seed = Math.random() * 50
            const shapeComplexity = Math.random() * 10 + 5

            data.push({ x, z, size, scaleX, scaleZ, rotation, seed, shapeComplexity })
        }
        return data
    }, [lakeCount, minSize, maxSize, spread])

    useImperativeHandle(ref, () => ({
        getLakesData: () => lakesData
    }))

    useFrame((state) => {
        if (!groupRef.current) return
        const t = state.clock.elapsedTime
        const camPos = state.camera.position

        groupRef.current.children.forEach((m) => {
            if (m.material?.uniforms) {
                const u = m.material.uniforms
                if (u.time) u.time.value = t

                if (u.headlightLeft) u.headlightLeft.value.set(camPos.x - 0.7, 1.2, camPos.z + 2.0)
                if (u.headlightRight) u.headlightRight.value.set(camPos.x + 0.7, 1.2, camPos.z + 2.0)
                if (u.cameraPos) u.cameraPos.value.copy(camPos)
            }
        })
    })

    useEffect(() => {
        if (!groupRef.current) return
        groupRef.current.traverse((c) => {
            if (c.isMesh) {
                c.renderOrder = -45
                c.frustumCulled = false
            }
        })
    }, [])

    if (!visible) return null

    return (
        <group ref={groupRef}>
            {lakesData.map((lake, i) => (
                <mesh
                    key={i}
                    position={[lake.x, floorY, lake.z]}
                    rotation={[-Math.PI / 2, 0, lake.rotation]}
                    scale={[lake.scaleX, lake.scaleZ, 1]} // Escala não uniforme para forma orgânica
                    receiveShadow
                >
                    <planeGeometry args={[lake.size, lake.size, 64, 64]} />

                    <shaderMaterial
                        transparent
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        blending={THREE.NormalBlending}
                        uniforms={{
                            time: { value: 0 },
                            seed: { value: lake.seed },
                            shapeComplexity: { value: lake.shapeComplexity },
                            reflectivity: { value: reflectivity },

                            // 🎨 CORES DE POÇA (Asfalto molhado/Barro escuro)
                            waterColorDeep: { value: new THREE.Color('#050505') }, // Quase preto (asfalto fundo)
                            waterColorShallow: { value: new THREE.Color('#151618') }, // Cinza escuro
                            groundColor: { value: new THREE.Color('#1a1c1e') }, // Chão seco ao redor

                            // Reflexos noturnos
                            skyColorDark: { value: new THREE.Color('#1a2530') },
                            skyColorBright: { value: new THREE.Color('#354a60') },

                            sunDirection: { value: new THREE.Vector3(0.6, 0.85, 0.5).normalize() },
                            sunColor: { value: new THREE.Color('#d4e8ff') },
                            sunIntensity: { value: 2.2 },

                            moonDirection: { value: new THREE.Vector3(-0.5, 0.4, -0.4).normalize() },
                            moonColor: { value: new THREE.Color('#7aa3d6') },
                            moonIntensity: { value: 0.7 },

                            ambientSky: { value: new THREE.Color('#2a3f5c') },
                            ambientGround: { value: new THREE.Color('#0f1216') },
                            ambientIntensity: { value: 0.5 },

                            headlightLeft: { value: new THREE.Vector3(0, 1, 0) },
                            headlightRight: { value: new THREE.Vector3(0, 1, 0) },
                            headlightColor: { value: new THREE.Color('#fffaf0') },
                            headlightIntensity: { value: 4.5 },

                            leafColor: { value: new THREE.Color('#f5ff92') },
                            leafEmissive: { value: new THREE.Color('#fffdcc') },
                            cameraPos: { value: new THREE.Vector3() }
                        }}

                        vertexShader={`
                            varying vec3 vWorldPos;
                            varying vec3 vNormal;
                            varying vec2 vUv;
                            varying vec3 vViewDir;
                            varying float vDepth;

                            uniform float time;
                            uniform float seed;

                            // 💧 MICRO ONDULAÇÕES (Vento na superfície fina)
                            float windRipple(vec2 p) {
                                float t = time * 0.8;
                                // Ondas muito pequenas e rápidas
                                return sin(p.x * 15.0 + t + seed) * cos(p.y * 12.0 - t * 0.5) * 0.002 +
                                       sin(p.x * 25.0 - t * 1.5) * 0.001;
                            }

                            void main() {
                                vUv = uv;
                                vec3 pos = position;
                                
                                // Poça é plana! Removemos as ondas grandes.
                                // Apenas micro vibrações
                                pos.y += windRipple(pos.xz);

                                // Normais para superfície quase plana
                                float delta = 0.01;
                                float h = windRipple(pos.xz);
                                float hx = windRipple(pos.xz + vec2(delta, 0.0));
                                float hz = windRipple(pos.xz + vec2(0.0, delta));
                                
                                vec3 tangent = normalize(vec3(delta, hx - h, 0.0));
                                vec3 bitangent = normalize(vec3(0.0, hz - h, delta));
                                vNormal = normalize(cross(bitangent, tangent));

                                vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                                vWorldPos = worldPos.xyz;
                                vViewDir = normalize(cameraPosition - vWorldPos);
                                
                                // Profundidade baseada no centro da geometria
                                vec2 centered = uv - 0.5;
                                vDepth = 1.0 - smoothstep(0.0, 0.5, length(centered));

                                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                            }
                        `}

                        fragmentShader={`
                            varying vec3 vWorldPos;
                            varying vec3 vNormal;
                            varying vec2 vUv;
                            varying vec3 vViewDir;
                            varying float vDepth;

                            uniform vec3 waterColorDeep;
                            uniform vec3 waterColorShallow;
                            uniform vec3 groundColor;
                            uniform vec3 skyColorDark;
                            uniform vec3 skyColorBright;
                            uniform float reflectivity;
                            uniform float shapeComplexity;
                            uniform float time;
                            
                            // Luzes
                            uniform vec3 sunDirection;
                            uniform vec3 sunColor;
                            uniform float sunIntensity;
                            uniform vec3 moonDirection;
                            uniform vec3 moonColor;
                            uniform float moonIntensity;
                            uniform vec3 ambientSky;
                            uniform vec3 ambientGround;
                            uniform float ambientIntensity;
                            uniform vec3 headlightLeft;
                            uniform vec3 headlightRight;
                            uniform vec3 headlightColor;
                            uniform float headlightIntensity;
                            uniform vec3 leafColor;
                            uniform vec3 leafEmissive;

                            // Noise functions
                            float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
                            
                            float noise(vec2 p) {
                                vec2 i = floor(p);
                                vec2 f = fract(p);
                                vec2 u = f * f * (3.0 - 2.0 * f);
                                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                            }

                            float fbm(vec2 p, int octaves) {
                                float value = 0.0;
                                float amp = 0.5;
                                for(int i = 0; i < 6; i++) {
                                    if(i >= octaves) break;
                                    value += amp * noise(p);
                                    p *= 2.0;
                                    amp *= 0.5;
                                }
                                return value;
                            }

                            // PBR Helpers
                            float DistributionGGX(vec3 N, vec3 H, float roughness) {
                                float a = roughness * roughness;
                                float a2 = a * a;
                                float NdotH = max(dot(N, H), 0.0);
                                float NdotH2 = NdotH * NdotH;
                                float denom = (NdotH2 * (a2 - 1.0) + 1.0);
                                return a2 / (3.14159 * denom * denom);
                            }

                            float GeometrySchlickGGX(float NdotV, float roughness) {
                                float r = (roughness + 1.0);
                                float k = (r * r) / 8.0;
                                return NdotV / (NdotV * (1.0 - k) + k);
                            }

                            float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
                                return GeometrySchlickGGX(max(dot(N, V), 0.0), roughness) * 
                                       GeometrySchlickGGX(max(dot(N, L), 0.0), roughness);
                            }

                            vec3 fresnelSchlick(float cosTheta, vec3 F0) {
                                return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
                            }

                            void main() {
                                vec3 N = normalize(vNormal);
                                vec3 V = normalize(vViewDir);
                                float NdotV = max(dot(N, V), 0.0);

                                // 💦 FÍSICA DE POÇA
                                // Poças são muito lisas (low roughness)
                                float roughness = 0.02; 
                                vec3 F0 = vec3(0.02); // Refletividade da água

                                // Forma Orgânica da Poça (Fractal)
                                vec2 uv = vUv - 0.5;
                                // Distorção forte para parecer líquido escorrido
                                float distort = fbm(uv * 4.0 + shapeComplexity * 0.1, 4);
                                vec2 warpedUV = uv + (distort - 0.5) * 0.15;
                                float dist = length(warpedUV);
                                
                                // Borda irregular
                                float edgeNoise = fbm(warpedUV * 8.0 + shapeComplexity * 0.2, 5);
                                float shapeMask = smoothstep(0.45 + edgeNoise * 0.1, 0.38 + edgeNoise * 0.1, dist);
                                
                                if (shapeMask < 0.01) discard; // Otimização

                                // Cor Base (Escura e "Suja")
                                // Mistura asfalto molhado com um pouco de profundidade
                                vec3 albedo = mix(waterColorShallow, waterColorDeep, vDepth);
                                
                                // Reflexo do Céu (Skybox fake)
                                vec3 R = reflect(-V, N);
                                float skyMix = smoothstep(-0.1, 0.4, R.y);
                                vec3 skyRefl = mix(skyColorDark, skyColorBright, skyMix);
                                
                                vec3 F = fresnelSchlick(NdotV, F0);
                                
                                // Combina cor base + céu
                                vec3 color = mix(albedo, skyRefl, F.x * reflectivity);

                                // Acumulador de Bloom
                                vec3 bloom = vec3(0.0);

                                // ILUMINAÇÃO (PBR Simplificado para performance + Visual)
                                
                                // 1. SOL
                                vec3 L_sun = sunDirection;
                                vec3 H_sun = normalize(L_sun + V);
                                float NdotL_sun = max(dot(N, L_sun), 0.0);
                                float NDF_sun = DistributionGGX(N, H_sun, roughness);
                                float G_sun = GeometrySmith(N, V, L_sun, roughness);
                                vec3 specSun = (NDF_sun * G_sun * F) / max(4.0 * NdotV * NdotL_sun, 0.001);
                                vec3 sunLight = sunColor * specSun * sunIntensity * NdotL_sun * 2.0;
                                color += sunLight;
                                bloom += sunLight * 2.0;

                                // 2. FARÓIS (O mais importante para poças na estrada)
                                // Farol Esquerdo
                                vec3 toL = headlightLeft - vWorldPos;
                                float dL = length(toL);
                                vec3 LL = normalize(toL);
                                float attL = 1.0 / (1.0 + 0.1 * dL + 0.03 * dL * dL); // Decaimento rápido
                                vec3 HL = normalize(LL + V);
                                float NdotLL = max(dot(N, LL), 0.0);
                                float NDF_L = DistributionGGX(N, HL, roughness);
                                vec3 specL = (NDF_L * F) * attL * headlightIntensity * 8.0; // Brilho intenso
                                color += headlightColor * specL * NdotLL;
                                bloom += headlightColor * specL * NdotLL * 3.0; // Muito bloom

                                // Farol Direito
                                vec3 toR = headlightRight - vWorldPos;
                                float dR = length(toR);
                                vec3 LR = normalize(toR);
                                float attR = 1.0 / (1.0 + 0.1 * dR + 0.03 * dR * dR);
                                vec3 HR = normalize(LR + V);
                                float NdotLR = max(dot(N, LR), 0.0);
                                float NDF_R = DistributionGGX(N, HR, roughness);
                                vec3 specR = (NDF_R * F) * attR * headlightIntensity * 8.0;
                                color += headlightColor * specR * NdotLR;
                                bloom += headlightColor * specR * NdotLR * 3.0;

                                // 3. REFLEXÃO DE FOLHAS (Estático fake)
                                float leafNoise = noise(vUv * 40.0);
                                float leafMask = step(0.92, leafNoise); // Apenas alguns pontos
                                vec3 leafRefl = leafEmissive * leafMask * (attL + attR + 0.1) * 2.0;
                                color += leafRefl;
                                bloom += leafRefl;

                                // 4. Bordas Molhadas (Wet edges)
                                // Escurece a borda onde a poça encontra o chão seco
                                float wetRim = smoothstep(0.0, 0.2, 1.0 - shapeMask);
                                color = mix(color, groundColor * 0.5, wetRim * 0.6);

                                // Aplica Bloom
                                color += bloom;

                                // Opacidade
                                // Poças são mais opacas no centro (profundas) e transparentes na borda
                                float alpha = shapeMask * mix(0.7, 0.95, F.x);

                                gl_FragColor = vec4(color, alpha);
                            }
                        `}
                    />
                </mesh>
            ))}
        </group>
    )
})

export default Lake
