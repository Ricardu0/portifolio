// src/components/ErrorBoundary.jsx
import React from 'react'

/**
 * ErrorBoundary - Captura erros de carregamento e renderização
 * Previne que a aplicação quebre completamente
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary capturou erro:', error, errorInfo)

        this.setState({
            error,
            errorInfo
        })

        // Opcional: Enviar erro para serviço de logging
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    handleRetry = () => {
        this.setState(prev => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prev.retryCount + 1
        }))
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            // Renderiza UI de erro customizada
            return this.props.fallback ? (
                this.props.fallback(this.state.error, this.handleRetry, this.handleReload)
            ) : (
                <DefaultErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    retryCount={this.state.retryCount}
                    onRetry={this.handleRetry}
                    onReload={this.handleReload}
                />
            )
        }

        return this.props.children
    }
}

/**
 * Fallback padrão para erros
 */
function DefaultErrorFallback({ error, errorInfo, retryCount, onRetry, onReload }) {
    const isDevelopment = process.env.NODE_ENV === 'development'

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #1a0000 0%, #0a0e1a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFDD0',
            padding: '2rem',
            zIndex: 10000
        }}>
            <div style={{
                maxWidth: '600px',
                background: 'rgba(10, 10, 10, 0.8)',
                border: '2px solid rgba(255, 253, 208, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 0 40px rgba(255, 0, 0, 0.3)'
            }}>
                {/* Ícone de Erro */}
                <div style={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    ⚠️
                </div>

                {/* Título */}
                <h1 style={{
                    fontSize: '2rem',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    color: '#ff6b6b'
                }}>
                    Ops! Algo deu errado
                </h1>

                {/* Mensagem */}
                <p style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    color: 'rgba(255, 253, 208, 0.8)',
                    lineHeight: '1.6'
                }}>
                    Encontramos um erro ao carregar o aplicativo.
                    Por favor, tente novamente.
                </p>

                {/* Detalhes do Erro (apenas em desenvolvimento) */}
                {isDevelopment && error && (
                    <details style={{
                        marginBottom: '2rem',
                        padding: '1rem',
                        background: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#ff6b6b',
                        maxHeight: '200px',
                        overflow: 'auto'
                    }}>
                        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                            Detalhes do erro (dev)
                        </summary>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0
                        }}>
                            {error.toString()}
                            {errorInfo?.componentStack}
                        </pre>
                    </details>
                )}

                {/* Botões de Ação */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {retryCount < 3 && (
                        <button
                            onClick={onRetry}
                            style={{
                                padding: '0.75rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#000',
                                background: '#FFFDD0',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 15px rgba(255, 253, 208, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 253, 208, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 253, 208, 0.3)'
                            }}
                        >
                            Tentar Novamente
                        </button>
                    )}

                    <button
                        onClick={onReload}
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#FFFDD0',
                            background: 'transparent',
                            border: '2px solid #FFFDD0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 253, 208, 0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        Recarregar Página
                    </button>
                </div>

                {retryCount >= 3 && (
                    <p style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        color: 'rgba(255, 253, 208, 0.6)'
                    }}>
                        Se o problema persistir, tente limpar o cache do navegador.
                    </p>
                )}
            </div>
        </div>
    )
}

/**
 * Wrapper para Suspense com fallback customizado
 */
export function SuspenseWrapper({ children, fallback }) {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={fallback || <DefaultSuspenseFallback />}>
                {children}
            </React.Suspense>
        </ErrorBoundary>
    )
}

function DefaultSuspenseFallback() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998
        }}>
            <div style={{
                color: '#FFFDD0',
                fontSize: '1.5rem',
                animation: 'pulse 2s infinite'
            }}>
                Carregando...
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}

export default ErrorBoundary