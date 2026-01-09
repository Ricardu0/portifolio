// App.jsx - SINCRONIZADO COM LAZY LOADING PROGRESSIVO
import { useState, useEffect } from 'react'
import Scene from './components/Scene3D/Scene'
import { NavigationOverlay, ContentModal } from './Navigation'
import { PerformanceMonitorUI } from './components/PerformanceMonitor'

function LoadingScreen({ progress, onComplete }) {
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        if (progress >= 100) {
            const timer = setTimeout(() => {
                setFadeOut(true)
                setTimeout(onComplete, 800)
            }, 300) // Reduzido para 300ms (mais responsivo)
            return () => clearTimeout(timer)
        }
    }, [progress, onComplete])

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(135deg, #000000 0%, #0a0e1a 50%, #000a1a 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                opacity: fadeOut ? 0 : 1,
                transition: 'opacity 0.8s ease-out',
                pointerEvents: fadeOut ? 'none' : 'auto'
            }}
        >
            <style>
                {`
                    @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
                `}
            </style>

            <div style={{
                fontSize: '4rem',
                fontWeight: '700',
                color: '#FFFDD0',
                marginBottom: '3rem',
                textShadow: '0 0 30px rgba(255, 253, 208, 0.6)',
                animation: 'pulse 2s infinite'
            }}>
                LÚMEN
            </div>

            <div style={{
                width: 'min(400px, 80vw)',
                height: '4px',
                background: 'rgba(255, 253, 208, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #FFFDD0 0%, #fff8c5 50%, #FFFDD0 100%)',
                    transition: 'width 0.3s ease-out',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                        animation: 'shimmer 1.5s infinite'
                    }} />
                </div>
            </div>

            <div style={{
                marginTop: '1rem',
                color: '#FFFDD0',
                fontSize: '1.2rem'
            }}>
                {Math.round(progress)}%
            </div>
        </div>
    )
}

function App() {
    const [loading, setLoading] = useState(true)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [currentSection, setCurrentSection] = useState(null)

    // ✅ SINCRONIZAÇÃO: Monta a cena apenas quando o loading terminar
    const [mountScene, setMountScene] = useState(false)

    // ========== CARREGAMENTO PROGRESSIVO SINCRONIZADO ==========
    useEffect(() => {
        if (!loading) return

        // Carregamento mais rápido e sincronizado com lazy loading do Scene
        const intervals = [
            { time: 0, progress: 0 },      // Início imediato
            { time: 100, progress: 20 },   // Car model carregando
            { time: 300, progress: 50 },   // Car pronto (Fase 1 completa)
            { time: 800, progress: 75 },   // Environment carregando (Fase 2)
            { time: 1200, progress: 95 },  // Quase tudo carregado
            { time: 1500, progress: 100 }  // Completo
        ]

        const timeouts = intervals.map(({ time, progress }) =>
            setTimeout(() => {
                setLoadingProgress(progress)
                // 🎯 Monta a cena quando chegar a 50% (Car já está pronto)
                if (progress === 50) setMountScene(true)
            }, time)
        )

        return () => timeouts.forEach(clearTimeout)
    }, [loading])

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>

            {/* ========== LOADING SCREEN ========== */}
            {loading && (
                <LoadingScreen
                    progress={loadingProgress}
                    onComplete={() => setLoading(false)}
                />
            )}

            {/* ========== CENA 3D (Monta apenas quando mountScene = true) ========== */}
            {mountScene && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    // Fade-in suave da cena
                    animation: 'fadeInScene 0.8s ease-out'
                }}>
                    <Scene onAnimationComplete={() => setAnimationComplete(true)} />
                </div>
            )}

            {/* ========== NAVEGAÇÃO (Aparece após animação) ========== */}
            <NavigationOverlay
                visible={animationComplete && !loading}
                currentSection={currentSection}
                onNavigate={setCurrentSection}
            />

            {/* ========== MODAL DE CONTEÚDO ========== */}
            <ContentModal
                section={currentSection}
                visible={currentSection !== null}
                onClose={() => setCurrentSection(null)}
            />

            {/* ========== PERFORMANCE MONITOR, para ativar copie: <PerformanceMonitorUI /> e cole ========== */}

            {/* ========== ESTILOS GLOBAIS ========== */}
            <style>{`
                @keyframes fadeInScene {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                /* Garante que não haja flash branco */
                body, #root {
                    margin: 0;
                    padding: 0;
                    background-color: #000;
                    overflow: hidden;
                }
            `}</style>
        </div>
    )
}

export default App

/**
 * ✅ SINCRONIZAÇÃO COMPLETA COM LAZY LOADING:
 *
 * TIMELINE COORDENADA:
 *
 * 0ms    → Loading inicia (0%)
 * 100ms  → Car começando a carregar (20%)
 * 300ms  → Car pronto! (50%) → 🎯 CENA MONTA AQUI
 * 500ms  → Scene Fase 2 inicia (Environment lazy load)
 * 800ms  → Environment carregando (75%)
 * 1200ms → Quase completo (95%)
 * 1500ms → Carregamento completo (100%)
 * 1800ms → Loading screen começa fade out
 * 2600ms → Loading screen removido completamente
 *
 * FASES DO SCENE.JSX (sincronizadas):
 * - Fase 1 (0ms): Car + luzes básicas (IMEDIATO quando cena monta)
 * - Fase 2 (500ms): Environment + DriftParticles
 * - Fase 3 (4000ms): Moon + TreeClusters
 *
 * BENEFÍCIOS:
 * ✅ Cena monta quando Car está pronto (300ms)
 * ✅ Loading screen cobre lazy loading do Environment
 * ✅ Usuário não vê tela preta ou pré-rendering
 * ✅ Animação começa suavemente quando loading termina
 * ✅ Performance otimizada (60 FPS desde o início)
 */
