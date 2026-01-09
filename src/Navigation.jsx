import React, { useState, useEffect } from 'react'
import curriculoPDF from './public/Curriculo - R. Fontes.pdf'

// ============= CONFIGURAÇÃO DE CORES =============
const theme = {
    color: '#FFFDD0',
    glow: 'rgba(255, 253, 208, 1.2)',
    dimmed: 'rgb(255,253,208)',
    transparentBase: 'rgba(255, 253, 208, 0)',
    stackBackground: 'rgba(255, 253, 208, 0.05)'
}

// ============= HOOK PARA RESPONSIVIDADE (apenas para modais) =============
function useMediaQuery(query) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)
        if (media.matches !== matches) {
            setMatches(media.matches)
        }
        const listener = () => setMatches(media.matches)
        media.addEventListener('change', listener)
        return () => media.removeEventListener('change', listener)
    }, [matches, query])

    return matches
}

// ============= ÍCONES SVG =============
const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

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

const ChevronDown = ({ isOpen }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            flexShrink: 0
        }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

// ============= COMPONENTES DE UI (ORIGINAIS - SEM MUDANÇAS) =============
function MenuButton({ icon, label, active, onClick }) {
    const [isHovered, setIsHovered] = useState(false)
    const isActive = active || isHovered;

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: isActive ? 'rgba(255, 253, 208, 0.05)' : 'transparent',
                border: isActive ? `2px solid ${theme.color}` : `2px solid ${theme.dimmed}`,
                color: isActive ? theme.color : theme.dimmed,
                borderRadius: '16px',
                padding: '1.5rem 3rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                minWidth: '280px',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                backdropFilter: 'blur(2px)',
                transform: isHovered ? 'translateX(15px)' : 'translateX(0)',
                boxShadow: isActive ? `0 0 30px ${theme.glow}, inset 0 0 10px ${theme.glow}` : 'none',
                appearance: 'none',
                WebkitAppearance: 'none'
            }}
        >
            {icon}
            {label}
        </button>
    )
}

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
                background: isHovered ? 'rgba(255, 253, 208, 0.1)' : 'transparent',
                border: isHovered ? `2px solid ${theme.color}` : `2px solid ${theme.dimmed}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isHovered ? theme.color : theme.dimmed,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(4px)',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isHovered ? `0 0 25px ${theme.glow}` : 'none'
            }}
        >
            {icon}
        </a>
    )
}

function DownloadButton({ pdfUrl, isMobile }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <a
            href={pdfUrl}
            download="Curriculo - R. Fontes.pdf"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                margin: '1.5rem 0',
                padding: isMobile ? '0.9rem 1.2rem' : '0.8rem 1.5rem',
                minHeight: '44px',
                background: isHovered ? theme.color : 'rgba(255, 253, 208, 0.08)',
                color: isHovered ? '#000' : theme.color,
                border: `1px solid ${theme.color}`,
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: isHovered ? `0 0 20px ${theme.glow}` : 'none',
                width: isMobile ? '100%' : 'fit-content',
                WebkitTapHighlightColor: 'transparent'
            }}
        >
            <DownloadIcon />
            <span>Baixar Currículo PDF</span>
        </a>
    )
}

// ✅ ACCORDION MELHORADO - Com scroll suave e responsividade
function DetailingAccordion({ detailingText, isMobile }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!detailingText) return null

    return (
        <div style={{
            marginTop: isMobile ? '1.25rem' : '1.5rem',
            borderTop: `1px solid rgba(255,253,208, 0.3)`
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: theme.color,
                    padding: isMobile ? '0.875rem 0' : '1rem 0',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    WebkitTapHighlightColor: 'transparent'
                }}
            >
                <span>Detalhamento</span>
                <ChevronDown isOpen={isOpen} />
            </button>

            {/* Container com scroll otimizado */}
            <div
                className="detailing-scroll"
                style={{
                    maxHeight: isOpen ? '500px' : '0',
                    overflow: 'auto',
                    transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isOpen ? 1 : 0,
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div style={{
                    padding: isMobile ? '0.875rem 0.5rem 0.875rem 0' : '1rem 0.5rem 1rem 0',
                    color: '#e0e0e0',
                    fontSize: isMobile ? '0.95rem' : '1.05rem',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line'
                }}>
                    {detailingText}
                </div>
            </div>
        </div>
    )
}

function StackAccordion({ stackData, isMobile }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!stackData) return null

    return (
        <div style={{
            marginTop: '1rem',
            borderTop: `1px solid rgba(255,253,208, 0.3)`
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: theme.color,
                    padding: isMobile ? '0.875rem 0' : '1rem 0',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    WebkitTapHighlightColor: 'transparent'
                }}
            >
                <span>Especificações Técnicas</span>
                <ChevronDown isOpen={isOpen} />
            </button>

            <div
                className="stack-scroll"
                style={{
                    maxHeight: isOpen ? '600px' : '0',
                    overflow: 'auto',
                    transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isOpen ? 1 : 0,
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div style={{ padding: isMobile ? '0.875rem 0' : '1rem 0' }}>
                    {Object.entries(stackData).map(([category, techs]) => (
                        <div key={category} style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{
                                color: theme.dimmed,
                                margin: '0 0 0.5rem 0',
                                fontSize: isMobile ? '0.85rem' : '0.9rem',
                                textTransform: 'uppercase'
                            }}>
                                {category}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {techs.map(tech => (
                                    <span key={tech} style={{
                                        background: theme.stackBackground,
                                        border: `1px solid ${theme.dimmed}`,
                                        color: theme.color,
                                        padding: isMobile ? '0.35rem 0.65rem' : '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: isMobile ? '0.8rem' : '0.85rem',
                                        boxShadow: `0 0 5px ${theme.stackBackground}`
                                    }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============= NAVEGAÇÃO ORIGINAL (SEM MUDANÇAS) =============
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
                left: '10%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                alignItems: 'flex-start'
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
                <SocialIcon icon={<GithubIcon />} href="https://github.com/Ricardu0" />
                <SocialIcon icon={<LinkedinIcon />} href="http://www.linkedin.com/in/ricardo-f-42986520b" />
                <SocialIcon icon={<MailIcon />} href="mailto:rikardohenriqueal@hotmail.com" />
            </div>
        </div>
    )
}

// ✅ MODAL RESPONSIVO MELHORADO (APENAS AS ABAS)
export function ContentModal({ section, visible, onClose }) {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const isTablet = useMediaQuery('(max-width: 1024px)')

    if (!visible) return null

    const content = {
        about: {
            title: 'Prazer, Ricardo!',
            text: 'Sou Ricardo Fontes, 20 anos, desenvolvedor de software multiplataforma e técnico administrativo. Possuo experiência prática em projetos utilizando Java/Spring, Node.js (Express), e ecossistema JavaScript (Vue, React, React Native). Tenho vivência com bancos de dados relacionais (MySQL, PostgreSQL) e NoSQL (MongoDB), além de conhecimentos em Azure, Git e Machine Learning. Abaixo você confere meu currículo detalhado.',
            stack: {
                "Linguagens": ["JavaScript (ES6+)", "Java 17", "Python", "SQL"],
                "Frameworks & Libs": ["React.js", "React Native", "Vue.js", "Spring Boot", "Express", "Three.js", "Axios", "Sequelize", "TailwindCSS"],
                "Infra & Tools": ["Git/GitHub", "Docker", "Azure", "MongoDB", "MySQL", "PostgreSQL"],
                "IA": ["Modelos clássicos supervisionados: Xgboost (Regressão Linear)", "Redes Neurais: Kohonen"]
            },
            hasResume: true
        },
        project1: {
            title: 'E-spike - Segurança Urbana',
            text: 'O E-spike surge da necessidade de mapear e informar sobre áreas de risco urbano combinado com interatividade social. Concebido no primeiro ano de faculdade, o projeto já passou por iterações em Java e Vue. Atualmente, foi refatorado para React Native com backend em Express, demonstrando a evolução técnica.',
            detailing: 'O projeto foi desenvolvido seguindo a arquitetura MVC (Model–View–Controller) desde suas primeiras versões, garantindo separação de responsabilidades, maior organização do código e facilidade de manutenção ao longo de sua evolução.\n\nO frontend passou por diferentes fases tecnológicas. Inicialmente, foi desenvolvido utilizando Vue.js em conjunto com Java, com foco em componentização, reaproveitamento de código e alinhamento à estrutura MVC.\n\nEm uma etapa posterior, o frontend foi reestruturado em Node.js, aproveitando a base da primeira versão e incorporando melhorias de UI e UX, além da adição de novas funcionalidades e ajustes estruturais visando maior clareza e escalabilidade do código.\n\nMais recentemente, o projeto evoluiu para React Native, reaproveitando conceitos consolidados das versões anteriores e introduzindo melhorias de usabilidade, especialmente nas funcionalidades de geração de pings e marcações no mapa, proporcionando uma experiência mais fluida em dispositivos móveis.\n\nDurante a evolução do projeto, também foram realizadas tentativas de aprimoramento arquitetural com base nos princípios do SOLID, buscando reduzir acoplamento, melhorar a legibilidade do código e facilitar futuras extensões do sistema.\n\nO backend também passou por mudanças conceituais importantes. Inicialmente, foi desenvolvido em Java com Spring Boot, utilizando Spring Security para autenticação, aliado a um banco de dados relacional PostgreSQL, priorizando robustez, consistência e escalabilidade a longo prazo.\n\nCom o amadurecimento do projeto, houve a migração para um banco de dados não relacional (NoSQL), utilizando MongoDB, com gerenciamento via MongoDB Compass e, posteriormente, MongoDB Atlas, visando maior flexibilidade, integração e desempenho.\n\nEm relação à segurança, foram implementadas melhorias progressivas, incluindo proteção mais rigorosa de rotas, refinamento dos mecanismos de autenticação e a realização de testes de caixa cinza, com o objetivo de identificar vulnerabilidades considerando tanto o comportamento externo quanto aspectos internos da aplicação.\n\nO projeto também contou com experiências reais de deploy em ambiente de produção, tendo sido hospedado na plataforma Render. Deixo aqui também meu Agradecimento ao meu amigo Kelvyn, que participou comigo desde o primeiro semestre desde as fases primárias de concepção de telas no figma, até as mais recentes stacks.',
            stack: {
                "Mobile": ["React Native", "Expo", "React Navigation"],
                "Frontend": ["React Native", "Já foi feito também em Vue.js"],
                "Backend": ["Node.js", "Express", "JWT Auth"],
                "Database": ["MongoDB", "PostgreSQL"],
                "Integrações": ["Google Maps API", "Open Street Maps"]
            }
        },
        project2: {
            title: 'Argus - Plataforma de Estudos',
            text: 'Argus é uma plataforma educacional centralizadora desenvolvida com Java Spring e React. O objetivo é oferecer acesso gratuito a matérias, temas e subtemas de forma organizada. O diferencial do projeto é a integração com LLMs para auxiliar no aprendizado personalizado do usuário, além de pequenos sistemas que induzem o usuário a voltar.',
            detailing:
                'O Argus surgiu a partir de uma percepção clara: a escassez de plataformas de estudo gratuitas que realmente atendam pessoas em situação de maior vulnerabilidade social. Embora existam ferramentas isoladas que auxiliem nos estudos, como checklists ou organizadores, não há uma solução totalmente gratuita que tenha como foco central esse público específico. O conteúdo educacional, em geral, encontra-se disperso, fragmentado e pouco estruturado.\n' +
                '\n' +
                'Diante dessa problemática, decidi desenvolver uma plataforma web que auxiliasse estudantes a se organizarem melhor em seus estudos, oferecendo uma experiência centralizada e intuitiva. Para isso, optei pelo React, tecnologia com a qual eu ainda não tinha domínio na época, mas possuía familiaridade conceitual devido à experiência prévia com Vue.js. No backend, utilizei Java, linguagem com a qual já havia tido contato, embora ainda estivesse em processo de aprofundamento.\n' +
                '\n' +
                'Tanto o backend quanto o frontend foram desenvolvidos seguindo a arquitetura MVC, com o objetivo de garantir padronização, organização do código e facilidade de manutenção. A partir dessa base, desenvolvi o frontend com foco em uma interface centralizadora, utilizando conceitos de drill down, permitindo que o usuário navegue de forma progressiva entre matérias, temas, subtemas e conteúdos, melhorando a usabilidade e a compreensão da estrutura educacional.\n' +
                '\n' +
                'Além disso, foi implementada uma página administrativa completa, permitindo o gerenciamento de todas as entidades do sistema — como Ensino, Conteúdo, Matéria, Subtema e Tema — oferecendo controle total sobre a organização da plataforma. Também foram desenvolvidos mecanismos voltados à retenção do usuário, como metas de uso diário, inspiradas em plataformas como o Duolingo, além de ferramentas de apoio ao estudo, como o método Pomodoro e a integração com APIs de LLMs, utilizadas para auxiliar em revisões rápidas e conteúdos mais introdutórios.\n' +
                '\n' +
                'Embora o projeto ainda não esteja finalizado, foi possível desenvolver uma solução funcional, organizada e visualmente agradável',
            stack: {
                "Frontend": ["React", "Tailwind CSS", "Axios"],
                "Backend": ["Java 17", "Spring Boot", "Spring Security", "JPA/Hibernate"],
                "IA & Data": ["Meta LLM API Integration", "MySql3"]
            }
        },
        project3: {
            title: 'Projeto Lúmen - Portfólio',
            text: 'O Projeto Lúmen (este portfólio) transcende a necessidade corporativa; é a exploração de liberdade artística. Desenvolvi este sistema para aprender Three.js, visando que a programação web pode ser imersiva e visual, indo além de interfaces estáticas tradicionais.',
            detailing: 'Lúmen\n\nO projeto Lúmen é, até certo ponto, um projeto pessoal — e digo isso de forma honesta. Ele surgiu inicialmente da necessidade de criar uma página de apresentação de portfólio. A ideia original era desenvolver algo simples e estático, uma página comum, quase como uma landing page, apenas apresentando quem eu sou. No entanto, senti a necessidade de ir além, de criar algo mais impactante e que também dialogasse com um desejo antigo: trabalhar com algo mais artístico.\n\nEm um primeiro momento, o Lúmen seria um projeto estático. Ainda assim, eu não queria algo genérico, mas também não desejava criar algo disfuncional ou difícil de rodar em diferentes dispositivos. A partir disso, iniciei o processo de concepção do projeto.\n\nA ideia inicial foi criar uma animação estática em 2D — algo que eu nunca havia feito, apesar da minha familiaridade com artes manuais e digitais. No entanto, eu queria que o projeto evocasse algo próximo de games, ou que fosse mais do que apenas uma animação. Cheguei à conclusão de que desenvolver algo em 3D poderia ser mais viável do que produzir uma animação tradicional (talvez um equívoco, sinceramente). E assim, o projeto começou a tomar forma.\n\nDesde o início, a intenção era ter um carro em movimento, transmitindo a sensação de velocidade. Ao mesmo tempo, queria que o visual remetesse a um desenho, quase como um rascunho vivo — algo alinhado ao fato de que desenhar é um dos meus hobbies —, mas que também transmitisse serenidade. Pensando em desempenho e versatilidade, optei por um modelo low poly, mais otimizado, e comecei a desenvolver a movimentação. Essa etapa foi particularmente desafiadora, pois, para simular a realidade, é necessário simular a física. Foi preciso criar sistemas de colisão, rotação das rodas com pivô adequado (já que inicialmente as rodas giravam de forma incorreta em relação à carroceria), planos com malha, entre outros ajustes técnicos.\n\nAo final dessa primeira etapa, eu tinha um carro que, tecnicamente, não se movia, mas visualmente parecia estar em movimento, sobre um fundo simples em tons de cinza e preto. Fiquei satisfeito, apesar da simplicidade do resultado — afinal, era um começo.\n\nEm seguida, passei a desenvolver a parte artística. A ideia inicial dos rascunhos foi descartada, pois isso exigiria alterações diretas no modelo 3D do carro, área na qual não tenho tanta proficiência, além da necessidade de criar modelos exclusivos para cada entidade. Diante das limitações de tempo, optei por desenvolver planos que simulassem o vazio ou algo etéreo, mas que ainda fossem visualmente interessantes. Nesse ponto, o projeto começou a ganhar identidade.\n\nTambém foi necessário resolver problemas de movimentação, o que levou à criação de um arquivo dedicado a essa lógica (scene.jsx), evitando comportamentos indesejados, como a sensação de estagnação da cena. Adicionei entidades como folhas e névoa (fog) para reduzir a sensação de vazio e, por fim, incluí uma lua — que acabou se assemelhando mais a um sol. Mas por que não criar um novo paradigma?\n\nApós consolidar a parte artística, iniciou-se a etapa mais desgastante do processo: a otimização. As primeiras versões não funcionavam em dispositivos móveis, e inicialmente eu acreditava que essa limitação fosse da própria biblioteca — o que não era verdade. Os shaders e demais recursos visuais estavam pesados demais. Com melhorias incrementais, consegui adaptar o projeto para o mobile, embora tenha gasto mais tempo resolvendo problemas de compatibilidade do que tomando decisões artísticas, o que foi frustrante durante o desenvolvimento. Ainda assim, ao final, alcancei um desempenho satisfatório.\n\nQuanto às tecnologias utilizadas, escolhi React por já ter familiaridade e também por questões de tempo. As demais decisões envolveram principalmente bibliotecas auxiliares, como o GSAP, utilizado para controle e acompanhamento das animações.\n\nObrigado por ter lido até aqui.',
            stack: {
                "Core 3D": ["Three.js", "React Three Fiber"],
                "Frontend": ["React 18", "Styled-components"],
                "Performance": ["GLSL Shaders", "Lazy Loading", "Texture Compression"]
            }
        }
    }

    const current = content[section]

    return (
        <>
            <style>{`
                .detailing-scroll::-webkit-scrollbar,
                .stack-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .detailing-scroll::-webkit-scrollbar-track,
                .stack-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .detailing-scroll::-webkit-scrollbar-thumb,
                .stack-scroll::-webkit-scrollbar-thumb {
                    background: ${theme.dimmed};
                    border-radius: 3px;
                }
                .detailing-scroll::-webkit-scrollbar-thumb:hover,
                .stack-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${theme.color};
                }
                .modal-content::-webkit-scrollbar {
                    width: 8px;
                }
                .modal-content::-webkit-scrollbar-track {
                    background: rgba(255, 253, 208, 0.05);
                }
                .modal-content::-webkit-scrollbar-thumb {
                    background: ${theme.dimmed};
                    border-radius: 4px;
                }
                .modal-content::-webkit-scrollbar-thumb:hover {
                    background: ${theme.color};
                }
            `}</style>

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    backdropFilter: 'blur(10px)',
                    padding: isMobile ? '1rem' : (isTablet ? '1.5rem' : '2rem'),
                    overflowY: 'auto'
                }}
                onClick={onClose}
            >
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'rgba(10, 10, 10, 0.95)',
                        border: `1px solid ${theme.color}`,
                        borderRadius: isMobile ? '16px' : '24px',
                        padding: isMobile ? '2rem 1.25rem' : (isTablet ? '2.5rem 2rem' : '3rem'),
                        maxWidth: isMobile ? '100%' : (isTablet ? '600px' : '650px'),
                        width: '100%',
                        maxHeight: isMobile ? '85vh' : '90vh',
                        overflowY: 'auto',
                        boxShadow: `0 0 50px rgba(0,0,0,0.8), 0 0 30px ${theme.glow}`,
                        position: 'relative',
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: isMobile ? '0.75rem' : '1rem',
                            right: isMobile ? '0.75rem' : '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: theme.color,
                            fontSize: '2rem',
                            cursor: 'pointer',
                            lineHeight: 1,
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s',
                            textShadow: `0 0 10px ${theme.glow}`,
                            WebkitTapHighlightColor: 'transparent',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
                    >
                        ×
                    </button>

                    <h2 style={{
                        color: theme.color,
                        fontSize: isMobile ? '1.5rem' : (isTablet ? '2rem' : '2.5rem'),
                        marginBottom: '1.5rem',
                        fontWeight: '700',
                        marginTop: 0,
                        textShadow: `0 0 15px ${theme.glow}`,
                        paddingRight: '3rem',
                        lineHeight: 1.2
                    }}>
                        {current.title}
                    </h2>

                    <p style={{
                        color: '#e0e0e0',
                        fontSize: isMobile ? '0.95rem' : (isTablet ? '1.1rem' : '1.2rem'),
                        lineHeight: '1.8',
                        margin: 0
                    }}>
                        {current.text}
                    </p>

                    {current.hasResume && (
                        <DownloadButton pdfUrl={curriculoPDF} isMobile={isMobile} />
                    )}

                    {current.detailing && (
                        <DetailingAccordion detailingText={current.detailing} isMobile={isMobile} />
                    )}

                    <StackAccordion stackData={current.stack} isMobile={isMobile} />
                </div>
            </div>
        </>
    )
}
