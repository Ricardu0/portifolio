import Scene from './components/Scene3D/Scene'

export default function App() {
  return (
      <div style={styles.app}>
        <Scene />
      </div>
  )
}

const styles = {
  app: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#000',
  }
}
