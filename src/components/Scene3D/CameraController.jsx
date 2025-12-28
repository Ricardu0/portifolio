import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function CameraController() {
    const { camera } = useThree()

    useEffect(() => {
        camera.position.set(0, 2.2, 10)
    }, [camera])

    useEffect(() => {
        camera.lookAt(new THREE.Vector3(0, 0, 0))
    }, [camera])

    return null
}
