// src/components/PerformanceMonitor.jsx
import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * PerformanceMonitor - Sistema completo de acompanhamento de performance
 *
 * ARQUITETURA:
 * 1. PerformanceMonitor (dentro do Canvas) - só coleta dados
 * 2. PerformanceMonitorUI (fora do Canvas) - renderiza a UI
 *
 * NOVO: Adiciona prop 'hidden' para deixar completamente oculto
 */

// ==================== PARTE 1: COLETOR (DENTRO DO CANVAS) ====================
export default function PerformanceMonitor({ position = 'top-right', minimal = false, hidden = false }) {
    const { gl } = useThree()
    const frameCountRef = useRef(0)
    const lastTimeRef = useRef(performance.now())

    useFrame(() => {
        // Se hidden=true, não coleta dados
        if (hidden) return

        const now = performance.now()
        const delta = now - lastTimeRef.current
        frameCountRef.current++

        if (delta >= 500) {
            const fps = Math.round((frameCountRef.current * 1000) / delta)
            const frameTime = delta / frameCountRef.current
            const info = gl.info
            const memory = info.memory || {}
            const render = info.render || {}

            // Envia dados para o window
            window.__perfStats = {
                fps,
                frameTime: frameTime.toFixed(2),
                drawCalls: render.calls || 0,
                triangles: render.triangles || 0,
                geometries: memory.geometries || 0,
                textures: memory.textures || 0,
                programs: gl.info.programs?.length || 0,
                memory: (performance.memory?.usedJSHeapSize / 1048576).toFixed(1) || 0
            }

            // Dispara evento customizado
            window.dispatchEvent(new CustomEvent('perfstats', { detail: window.__perfStats }))

            frameCountRef.current = 0
            lastTimeRef.current = now
        }
    })

    // Passa config para a UI
    useEffect(() => {
        window.__perfConfig = { position, minimal, hidden }
    }, [position, minimal, hidden])

    return null
}

// ==================== PARTE 2: UI (FORA DO CANVAS) ====================
// Este componente deve ser colocado FORA do <Canvas> no seu App.js

function MiniGraph({ values, color = '#00ff00', height = 30, width = 100 }) {
    const canvasRef = useRef()

    useEffect(() => {
        if (!canvasRef.current || values.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1

        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, width, height)

        const max = Math.max(...values, 1)
        const min = Math.min(...values, 0)
        const range = max - min || 1

        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.beginPath()

        values.forEach((value, i) => {
            const x = (i / (values.length - 1)) * width
            const normalized = (value - min) / range
            const y = height - normalized * height

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.stroke()
    }, [values, color, height, width])

    return <canvas ref={canvasRef} style={{ display: 'block' }} />
}

export function PerformanceMonitorUI() {
    const [stats, setStats] = useState({
        fps: 0,
        frameTime: 0,
        drawCalls: 0,
        triangles: 0,
        geometries: 0,
        textures: 0,
        programs: 0,
        memory: 0
    })
    const [config, setConfig] = useState({ position: 'top-right', minimal: false, hidden: false })
    const [visible, setVisible] = useState(true)
    const fpsHistory = useRef([])

    // Escuta eventos de stats
    useEffect(() => {
        const handleStats = (e) => {
            setStats(e.detail)
        }
        window.addEventListener('perfstats', handleStats)
        return () => window.removeEventListener('perfstats', handleStats)
    }, [])

    // Pega config
    useEffect(() => {
        if (window.__perfConfig) {
            setConfig(window.__perfConfig)
        }
    }, [])

    // Atualiza histórico de FPS
    useEffect(() => {
        if (stats.fps > 0) {
            fpsHistory.current.push(stats.fps)
            if (fpsHistory.current.length > 60) {
                fpsHistory.current.shift()
            }
        }
    }, [stats.fps])

    // Toggle com tecla P
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'p' || e.key === 'P') {
                setVisible(v => !v)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    // Se hidden=true, não renderiza nada
    if (config.hidden) {
        return null
    }

    if (!visible) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#0f0',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                cursor: 'pointer',
                zIndex: 9999
            }} onClick={() => setVisible(true)}>
                Press P
            </div>
        )
    }

    const positionStyles = {
        'top-left': { top: '10px', left: '10px' },
        'top-right': { top: '10px', right: '10px' },
        'bottom-left': { bottom: '10px', left: '10px' },
        'bottom-right': { bottom: '10px', right: '10px' }
    }

    const getFPSColor = (fps) => {
        if (fps >= 55) return '#00ff00'
        if (fps >= 30) return '#ffff00'
        return '#ff0000'
    }

    const getDrawCallsColor = (calls) => {
        if (calls <= 50) return '#00ff00'
        if (calls <= 100) return '#ffff00'
        return '#ff9900'
    }

    if (config.minimal) {
        return (
            <div style={{
                position: 'fixed',
                ...positionStyles[config.position],
                background: 'rgba(0, 0, 0, 0.85)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                zIndex: 9999,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
            }} onClick={() => setVisible(false)}>
                <span style={{ color: getFPSColor(stats.fps) }}>{stats.fps} FPS</span>
                {' | '}
                <span style={{ color: getDrawCallsColor(stats.drawCalls) }}>{stats.drawCalls} DC</span>
            </div>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            ...positionStyles[config.position],
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            minWidth: '220px',
            zIndex: 9999,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <span style={{ fontWeight: 'bold', color: '#00ff00' }}>⚡ PERFORMANCE</span>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        lineHeight: '1'
                    }}
                >×</button>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#888' }}>FPS</span>
                    <span style={{
                        color: getFPSColor(stats.fps),
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {stats.fps}
                    </span>
                </div>
                <MiniGraph values={fpsHistory.current} color={getFPSColor(stats.fps)} width={196} height={25} />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <span style={{ color: '#888' }}>Frame Time</span>
                <span style={{ color: '#0ff' }}>{stats.frameTime} ms</span>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <span style={{ color: '#888' }}>Draw Calls</span>
                <span style={{ color: getDrawCallsColor(stats.drawCalls) }}>
                    {stats.drawCalls}
                </span>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <span style={{ color: '#888' }}>Triangles</span>
                <span style={{ color: '#ff0' }}>
                    {stats.triangles.toLocaleString()}
                </span>
            </div>

            <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    color: '#888',
                    fontSize: '11px',
                    marginBottom: '6px',
                    fontWeight: 'bold'
                }}>
                    RESOURCES
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>
                        <span style={{ color: '#666', fontSize: '10px' }}>Geometries</span>
                        <div style={{ color: '#0f0', fontSize: '13px' }}>{stats.geometries}</div>
                    </div>
                    <div>
                        <span style={{ color: '#666', fontSize: '10px' }}>Textures</span>
                        <div style={{ color: '#0f0', fontSize: '13px' }}>{stats.textures}</div>
                    </div>
                    <div>
                        <span style={{ color: '#666', fontSize: '10px' }}>Programs</span>
                        <div style={{ color: '#0f0', fontSize: '13px' }}>{stats.programs}</div>
                    </div>
                    {stats.memory > 0 && (
                        <div>
                            <span style={{ color: '#666', fontSize: '10px' }}>Memory</span>
                            <div style={{ color: '#0f0', fontSize: '13px' }}>{stats.memory} MB</div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '10px',
                color: '#666',
                textAlign: 'center'
            }}>
                Press P to toggle
            </div>
        </div>
    )
}
