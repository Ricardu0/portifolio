// src/hooks/useAssetPreloader.js
import { useState, useEffect, useCallback } from 'react'

/**
 * Hook customizado para preload de assets
 * Gerencia carregamento de GLB, texturas, e outros recursos
 */
export function useAssetPreloader(assets = [], options = {}) {
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState([])
    const [loadedAssets, setLoadedAssets] = useState([])

    const {
        onProgress,
        onComplete,
        onError,
        stopOnError = false
    } = options

    const loadAsset = useCallback(async (assetPath, index, total) => {
        try {
            // Tenta carregar o asset
            const response = await fetch(assetPath, {
                method: 'HEAD',
                cache: 'force-cache'
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Asset carregado com sucesso
            const currentProgress = ((index + 1) / total) * 100
            setProgress(currentProgress)
            onProgress?.(currentProgress, assetPath)

            setLoadedAssets(prev => [...prev, { path: assetPath, loaded: true }])

            return { path: assetPath, success: true }

        } catch (error) {
            console.warn(`Erro ao carregar ${assetPath}:`, error.message)

            const errorInfo = { path: assetPath, error: error.message }
            setErrors(prev => [...prev, errorInfo])
            onError?.(errorInfo)

            setLoadedAssets(prev => [...prev, { path: assetPath, loaded: false, error: error.message }])

            if (stopOnError) {
                throw error
            }

            return { path: assetPath, success: false, error: error.message }
        }
    }, [onProgress, onError, stopOnError])

    useEffect(() => {
        if (assets.length === 0) {
            setLoading(false)
            setProgress(100)
            onComplete?.({ assets: [], errors: [] })
            return
        }

        let cancelled = false

        const loadAllAssets = async () => {
            setLoading(true)
            setProgress(0)
            setErrors([])
            setLoadedAssets([])

            const results = []

            for (let i = 0; i < assets.length; i++) {
                if (cancelled) break

                const result = await loadAsset(assets[i], i, assets.length)
                results.push(result)
            }

            if (!cancelled) {
                setLoading(false)
                setProgress(100)
                onComplete?.({
                    assets: results,
                    errors,
                    successCount: results.filter(r => r.success).length,
                    failCount: results.filter(r => !r.success).length
                })
            }
        }

        loadAllAssets()

        return () => {
            cancelled = true
        }
    }, [assets, loadAsset, onComplete])

    return {
        progress,
        loading,
        errors,
        loadedAssets,
        isComplete: !loading && progress === 100,
        hasErrors: errors.length > 0
    }
}

/**
 * Hook simplificado para preload de imagens
 */
export function useImagePreloader(imagePaths = []) {
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (imagePaths.length === 0) {
            setLoading(false)
            setProgress(100)
            return
        }

        let loadedCount = 0
        const total = imagePaths.length

        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image()

                img.onload = () => {
                    loadedCount++
                    setProgress((loadedCount / total) * 100)
                    resolve(src)
                }

                img.onerror = () => {
                    loadedCount++
                    setProgress((loadedCount / total) * 100)
                    console.warn(`Falha ao carregar imagem: ${src}`)
                    resolve(src)
                }

                img.src = src
            })
        }

        Promise.all(imagePaths.map(loadImage))
            .then(() => {
                setLoading(false)
            })

    }, [imagePaths])

    return { progress, loading, isComplete: !loading }
}

/**
 * Preload manual de um único asset
 */
export async function preloadAsset(url, options = {}) {
    const { timeout = 10000 } = options

    return Promise.race([
        fetch(url, { method: 'HEAD', cache: 'force-cache' }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
        )
    ])
}

export default useAssetPreloader