import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function Environment() {
    const { scene } = useThree()

    // Fundo levemente acinzentado (evita branco chapado)
    scene.background = new THREE.Color('#e3e3e3')

    // Neblina cria profundidade e sensação de distância
    scene.fog = new THREE.Fog('#e3e3e3', 20, 120)

    return (
        <>
            {/* Luz ambiente baixa para não achatar a cena */}
            <ambientLight intensity={0.3} />

            {/* Luz principal (sol) */}
            <directionalLight
                position={[20, 25, 10]}
                intensity={1.6}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={1}
                shadow-camera-far={200}
                shadow-camera-left={-80}
                shadow-camera-right={80}
                shadow-camera-top={80}
                shadow-camera-bottom={-80}
            />

            {/* Luz secundária fraca para suavizar sombras */}
            <directionalLight
                position={[-15, 10, -10]}
                intensity={0.25}
            />

            {/* Chão */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.02, 0]}
                receiveShadow
            >
                <planeGeometry args={[3000, 3000, 50, 50]} />
                <meshStandardMaterial
                    color="#dcdcdc"
                    roughness={0.85}
                    metalness={0.05}
                />
            </mesh>
        </>
    )
}
