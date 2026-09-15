import './App.css'
import steamConLogo from './assets/steamcon-logo.png'

function App() {
  return (
    <main className="app">
      <img
        className="steamcon-logo"
        src={steamConLogo}
        alt="STEAM Con"
      />

      <p>Science, Technology, Engineering, Art, and Mathematics</p>
    </main>
  )
}

export default App