import { useState } from 'react'
import Scene from './components/Scene3D/Scene'
import { NavigationOverlay, ContentModal } from './Navigation'

function App() {
    const [animationComplete, setAnimationComplete] = useState(false)
    const [currentSection, setCurrentSection] = useState(null)

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
            <Scene onAnimationComplete={() => setAnimationComplete(true)} />

            <NavigationOverlay
                visible={animationComplete}
                currentSection={currentSection}
                onNavigate={setCurrentSection}
            />

            <ContentModal
                section={currentSection}
                visible={currentSection !== null}
                onClose={() => setCurrentSection(null)}
            />
        </div>
    )
}

export default App