import React, { useState } from 'react'

// ============= CONFIGURAÇÃO DE CORES =============
// Paleta Creme / Branco Amarelado para contraste máximo
const theme = {
    color: '#FFFDD0',                // Cor principal (Creme)
    glow: 'rgba(255, 253, 208, 1.2)', // Cor do brilho (Neon)
    dimmed: 'rgb(255,253,208)', // Cor inativa (translucida)
    transparentBase: 'rgba(255, 253, 208, 0)' // Transparente "branco" (para evitar sujeira na transição)
}

// ============= ÍCONES SVG =============
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const CodeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
)

const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
)

const GithubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
)

const LinkedinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
)

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
)

const SunIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)


// ============= BOTÃO DO MENU (CORRIGIDO) =============
function MenuButton({ icon, label, active, onClick }) {
    const [isHovered, setIsHovered] = useState(false)

    // Estado ativo ou hover
    const isActive = active || isHovered;

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                // FUNDO: Força transparência real (sem azul)
                background: isActive ? 'rgba(255, 253, 208, 0.05)' : 'transparent',

                // BORDA: Branca sólida (ativa) vs Branca translucida (inativa)
                border: isActive
                    ? `2px solid ${theme.color}`
                    : `2px solid ${theme.dimmed}`,

                // TEXTO:
                color: isActive ? theme.color : theme.dimmed,

                // FORMATO
                borderRadius: '16px',
                padding: '1.5rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                minWidth: '280px',

                // EFEITOS
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Transição suave
                backdropFilter: 'blur(2px)',
                transform: isHovered ? 'translateX(15px)' : 'translateX(0)',

                // O BOOM (Sombra neon)
                boxShadow: isActive
                    ? `0 0 30px ${theme.glow}, inset 0 0 10px ${theme.glow}` // Brilho interno e externo
                    : 'none',

                // Remove estilos padrão do navegador que podem causar o azul
                appearance: 'none',
                WebkitAppearance: 'none'
            }}
        >
            {icon}
            {label}
        </button>
    )
}

// ============= ÍCONE SOCIAL (CORRIGIDO) =============
function SocialIcon({ icon, href }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',

                // CORREÇÃO DO FUNDO:
                // Antes era azul translúcido, agora é transparente
                background: isHovered ? 'rgba(255, 253, 208, 0.1)' : 'transparent',

                // BORDA:
                border: isHovered
                    ? `2px solid ${theme.color}`
                    : `2px solid ${theme.dimmed}`,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                // COR DO ÍCONE:
                color: isHovered ? theme.color : theme.dimmed,

                transition: 'all 0.3s ease',
                backdropFilter: 'blur(4px)',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',

                // BOOM NO ÍCONE
                boxShadow: isHovered
                    ? `0 0 25px ${theme.glow}`
                    : 'none'
            }}
        >
            {icon}
        </a>
    )
}

// ============= OVERLAY DE NAVEGAÇÃO =============
export function NavigationOverlay({ visible, onNavigate, currentSection }) {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: visible ? 'auto' : 'none',
                opacity: visible ? 1 : 0,
                transition: 'opacity 1.5s ease',
                zIndex: 10
            }}
        >
            <nav style={{
                position: 'absolute',
                top: '30%',
                left: '10%', // Mantendo na esquerda
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                alignItems: 'flex-start' // Alinhado ao início
            }}>
                <MenuButton
                    icon={<UserIcon />}
                    label="Sobre Mim"
                    active={currentSection === 'about'}
                    onClick={() => onNavigate('about')}
                />
                <MenuButton
                    icon={<CodeIcon />}
                    label="Projeto E-spike"
                    active={currentSection === 'project1'}
                    onClick={() => onNavigate('project1')}
                />
                <MenuButton
                    icon={<BriefcaseIcon />}
                    label="Projeto Argus"
                    active={currentSection === 'project2'}
                    onClick={() => onNavigate('project2')}
                />
                <MenuButton
                    icon={<SunIcon />}
                    label="Projeto Lúmen"
                    active={currentSection === 'project3'}
                    onClick={() => onNavigate('project3')}
                />
            </nav>

            <div style={{
                position: 'absolute',
                right: '2rem',
                bottom: '2rem',
                display: 'flex',
                gap: '1rem'
            }}>
                <SocialIcon icon={<GithubIcon />} href="https://github.com" />
                <SocialIcon icon={<LinkedinIcon />} href="https://linkedin.com" />
                <SocialIcon icon={<MailIcon />} href="mailto:seu@email.com" />
            </div>
        </div>
    )
}

// ============= MODAL DE CONTEÚDO =============
export function ContentModal({ section, visible, onClose }) {
    if (!visible) return null

    const content = {
        about: {
            title: 'Prazer Te Conhecer!',
            text: 'Meu nome é Ricardo Fontes, tenho 20 anos e sou desenvolvedor de software multiplataforma e técnico administrativo.' + ' Tenho experiencia prática em projetos usando Java/Spring, Node/Express/Three.js, Vue/React/ReactNative, e bancos de dados relacional (MySql, Postgress) e noSql (MongoDb).' +
                'Mas também tenho conhecimento em outros aspectos (como git, azure, machine learning). Se quiser saber mais, meu curriculo está abaixo!'
        },
        project1: {
            title: 'Espike - Em Andamento',
            text: 'O Espike é um software que surge da necessidade de existir um aplicativo que informe locais de periculosidade. Concebido desde o primeiro ano de faculdade, e de já ter sido feito em Java, e em Vue, e agora migrado para React Native + Express, demonstra evolucao.'
        },
        project2: {
            title: 'Argus - Em Andamento',
            text: 'Argus é um projeto feito com Java Spring + React, com foco em servir como plataforma de estudos gratuito (onde o usuario tem acesso a materias, temas, subtemas, etc), de maneira centralizadora. Também conta com suporte a LLMs.' +
                'Tecnologias utilizadas: Java, Java Spring, React, Express, TailwindCss'
        },
        project3: {
            title: 'Projeto Lúmen',
            text: 'O projeto lúmen (este que voce está presenciando agora), é o meu portifólio. Além da necessidade corporativa, desenvolvi um sistema frontend com uma biblioteca que nunca tinha utilizado antes, que é o Three.js. Ele nao nasce somente como parte da necessidade corporativa, mas também da vontade da liberdade artística. É a minha tentativa de mostrar que programar também pode ser criativo e visual, não só telas estáticas.'
        }
    }

    const current = content[section]

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.85)', // Fundo escuro para destacar o modal
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'rgba(10, 10, 10, 0.95)', // Quase preto para contraste
                    border: `1px solid ${theme.color}`,
                    borderRadius: '24px',
                    padding: '3rem',
                    maxWidth: '600px',
                    width: '90%',
                    boxShadow: `0 0 50px rgba(0,0,0,0.8), 0 0 30px ${theme.glow}`, // Boom no modal
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: theme.color,
                        fontSize: '2rem',
                        cursor: 'pointer',
                        lineHeight: 1,
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s',
                        textShadow: `0 0 10px ${theme.glow}`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
                >
                    ×
                </button>
                <h2 style={{
                    color: theme.color,
                    fontSize: '2.5rem',
                    marginBottom: '1.5rem',
                    fontWeight: '700',
                    marginTop: 0,
                    textShadow: `0 0 15px ${theme.glow}`
                }}>
                    {current.title}
                </h2>
                <p style={{
                    color: '#e0e0e0', // Texto interno mantém um cinza claro para leitura
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    margin: 0
                }}>
                    {current.text}
                </p>
            </div>
        </div>
    )
}
