// src/components/Scene3D/Fog.jsx - FOG ULTRA DENSO
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export default function Fog({
                                color = '#9eadb8',
                                initialDensity = 0.025,  // 🔥 MÁXIMO DE DENSIDADE
                                minDensity = 0.0008,
                                onFadeComplete
                            }) {
    const { scene } = useThree()
    const fogRef = useRef()
    const fogDataRef = useRef({
        density: initialDensity,
        colorObj: new THREE.Color(color)
    })

    useEffect(() => {
        // Remove fog antigo se existir
        if (scene.fog) {
            scene.fog = null
        }

        const fog = new THREE.FogExp2(color, initialDensity)
        scene.fog = fog
        fogRef.current = fog

        console.log('🌫️ FOG ULTRA DENSO | Densidade:', initialDensity)

        return () => {
            scene.fog = null
        }
    }, [scene, color, initialDensity])

    const fadeOutLinear = (duration = 5) => {
        return new Promise((resolve) => {
            if (!fogRef.current) {
                resolve()
                return
            }

            gsap.to(fogDataRef.current, {
                density: minDensity,
                duration,
                ease: 'linear',
                onUpdate: () => {
                    if (fogRef.current) {
                        fogRef.current.density = fogDataRef.current.density
                    }
                },
                onComplete: () => {
                    console.log('✅ Fog dissipado')
                    onFadeComplete?.()
                    resolve()
                }
            })
        })
    }

    const fadeOutFast = (duration = 1.8) => {
        return new Promise((resolve) => {
            if (!fogRef.current) {
                resolve()
                return
            }

            gsap.to(fogDataRef.current, {
                density: 0,
                duration,
                ease: 'power2.out',
                onUpdate: () => {
                    if (fogRef.current) {
                        fogRef.current.density = fogDataRef.current.density
                    }
                },
                onComplete: () => {
                    if (scene.fog) {
                        scene.fog = null
                    }
                    resolve()
                }
            })
        })
    }

    useEffect(() => {
        window.__fogController = { fadeOutLinear, fadeOutFast }
        return () => { window.__fogController = null }
    }, [])

    return null
}

export const fadeFogLinear = (duration = 5) => {
    if (window.__fogController) {
        return window.__fogController.fadeOutLinear(duration)
    }
    return Promise.resolve()
}

export const removeFog = (duration = 1.8) => {
    if (window.__fogController) {
        return window.__fogController.fadeOutFast(duration)
    }
    return Promise.resolve()
}
