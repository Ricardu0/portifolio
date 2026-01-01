// src/components/Scene3D/CameraController.jsx
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export default function CameraController() {
    const { camera } = useThree()

    useEffect(() => {
        // Define APENAS a posição inicial
        // O useFrame no SceneContent vai assumir o controle depois
        camera.position.set(0, 2.5, 12)
    }, [camera])

    // NÃO faz lookAt aqui para não interferir com o useFrame
    return null
}