import React, { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import Car from './Car'
import Environment from './Environment'
import CameraController from './CameraController'
import DriftParticles from './DriftParticles'

function SceneContent() {
    const carRef = useRef()
    const speedRef = useRef(0)
    const steeringAngleRef = useRef(0)
    const isDriftingRef = useRef(false)
    const { camera } = useThree()
    const tlRef = useRef()

    useEffect(() => {
        if (tlRef.current) return

        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
        tlRef.current = tl

        // 1) SPAWN - Mais suave e natural
        tl.fromTo(
            carRef.current.scale,
            { x: 0, y: 0, z: 0 },
            {
                x: 0.8,
                y: 0.8,
                z: 0.8,
                duration: 0.9,  // Um pouco mais lento
                ease: 'back.out(1.5)'  // Menos bounce (era 2.0)
            }
        )

        // Rotação suave no spawn
        tl.fromTo(
            carRef.current.rotation,
            { y: 0.5, x: 0.2, z: 0.1 },  // Menos inclinação inicial
            {
                y: 0.5,
                x: 0,
                z: 0,
                duration: 0.9,
                ease: 'power2.out'  // Mais suave que elastic
            },
            '<'
        )

        // Leve bounce vertical no spawn (vida!)
        tl.fromTo(
            carRef.current.position,
            { y: 0.3 },  // Começa um pouco elevado
            {
                y: 0,
                duration: 0.9,
                ease: 'bounce.out'  // Bounce só no Y
            },
            '<'
        )

        // 2) APROXIMAÇÃO - Mais controlada
        tl.to(carRef.current.position, {
            x: 0.8,
            z: -1,
            duration: 2.0,  // Um pouco mais lento (era 1.8)
            ease: 'power1.inOut'  // Mais suave
        })

        // 3) ACELERAÇÃO - Progressiva
        tl.to(speedRef, {
            current: 4.8,  // Um pouco menos (era 5.5)
            duration: 1.8,
            ease: 'power2.in'  // Menos agressivo (era power3)
        }, '<0.4')

        // 4) PRIMEIRA CURVA - Suave e natural
        tl.to(carRef.current.rotation, {
            y: '+=0.6',  // Menos acentuada (era 0.7)
            duration: 1.1,  // Um pouco mais lento
            ease: 'sine.inOut'
        })

        // Esterçamento mais suave
        tl.to(steeringAngleRef, {
            current: 0.45,  // Menos intenso (era 0.5)
            duration: 0.5,  // Mais lento (era 0.4)
            ease: 'power2.out'
        }, '<')

        // Fumaça entra gradualmente
        tl.to(isDriftingRef, {
            current: true,
            duration: 0.1
        }, '<0.25')

        // Volta ao centro
        tl.to(steeringAngleRef, {
            current: 0,
            duration: 0.6,
            ease: 'power2.inOut'  // Mais suave
        })

        // Reduz velocidade
        tl.to(speedRef, {
            current: 2.2,  // Menos (era 2.5)
            duration: 0.9,
            ease: 'power2.out'
        }, '<-0.3')

        // Para fumaça
        tl.to(isDriftingRef, {
            current: false,
            duration: 0.1
        })

        // 5) GIRO 180° - Mais controlado

        // Desacelera
        tl.to(speedRef, {
            current: 1.2,  // Menos (era 1.4)
            duration: 0.6,
            ease: 'power2.in'
        })

        // Ativa drift
        tl.to(isDriftingRef, {
            current: true,
            duration: 0.1
        })

        // Esterçamento gradual
        tl.to(steeringAngleRef, {
            current: 0.6,  // Menos (era 0.7)
            duration: 0.4,
            ease: 'power1.in'
        })

        // GIRO 180° mais suave
        tl.to(carRef.current.rotation, {
            y: '+=3.14159',
            duration: 1.4,  // Um pouco mais lento
            ease: 'power1.inOut',
            onUpdate: function() {
                const progress = this.progress()
                // Esterçamento variável mais suave
                steeringAngleRef.current = 0.6 * Math.sin(progress * Math.PI)
            }
        }, '<0.1')

        // Para drift
        tl.to(isDriftingRef, {
            current: false,
            duration: 0.2
        }, '-=0.5')

        // 6) FREADA - Suave
        tl.to(speedRef, {
            current: 0.0,
            duration: 1.2,  // Mais lento (era 1.0)
            ease: 'power2.out'  // Menos agressivo
        })

        // Centraliza volante suavemente
        tl.to(steeringAngleRef, {
            current: 0,
            duration: 0.7,
            ease: 'power2.inOut'  // Menos elástico
        }, '<')

        // 7) CÂMERA - Movimento otimizado

        // FASE 1: Sobe moderadamente
        tl.to(camera.position, {
            y: 8,    // Menos (era 12)
            x: -1.5, // Menos lateral (era -2)
            z: 7,    // Mais longe (era 8)
            duration: 1.8,
            delay: 0.3,
            ease: 'power2.inOut'
        })

        tl.to(camera.rotation, {
            x: 0.25,  // Menos inclinação (era 0.3)
            y: 0.08,  // Menos rotação (era 0.1)
            duration: 1.8,
            ease: 'power2.inOut'
        }, '<')

        // FASE 2: Posição final ideal
        tl.to(camera.position, {
            y: 14,   // Menos alto (era 20)
            x: 0,
            z: 6,    // Mais perto (era 5)
            duration: 2.0,
            ease: 'power1.inOut'  // Mais suave
        })

        tl.to(camera.rotation, {
            x: 0.5,   // Menos inclinação (era 0.6)
            y: 0,
            duration: 2.0,
            ease: 'power1.inOut'
        }, '<')

    }, [camera])

    return (
        <>
            <Environment />
            <Car
                carRef={carRef}
                speedRef={speedRef}
                steeringAngleRef={steeringAngleRef}
            />
            <DriftParticles
                carRef={carRef}
                isActive={isDriftingRef}
                steeringAngleRef={steeringAngleRef}
            />
        </>
    )
}

export default function Scene() {
    return (
        <Canvas
            camera={{ position: [0, 2.5, 12], fov: 48 }}  // FOV um pouco menor (era 50)
            shadows
            gl={{ antialias: true }}
        >
            <CameraController />
            <SceneContent />
        </Canvas>
    )
}
