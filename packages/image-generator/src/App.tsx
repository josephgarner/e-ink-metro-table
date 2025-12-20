import { useState } from 'react'
import DisplayPreview from './components/DisplayPreview'
import ExampleDisplay from './components/ExampleDisplay'
import './App.css'
import MetroStatus from './components/Metro/MetroStatus'

function App() {
  const [selectedComponent, setSelectedComponent] = useState<string>('example')

  const components = {
    example: <ExampleDisplay />,
    metro: <MetroStatus />,

    // Add more components here as you create them
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>E-Ink Display Generator</h1>
        <p>Preview and generate images for 7.3" E-Ink Spectra 6 display (800x480)</p>
      </header>

      <div className="component-selector">
        <label htmlFor="component-select">Select Component: </label>
        <select
          id="component-select"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          <option value="example">Example Display</option>
          <option value="metro">Metro</option>
          {/* Add more options as you create components */}
        </select>
      </div>

      <DisplayPreview>{components[selectedComponent as keyof typeof components]}</DisplayPreview>

      <div className="instructions">
        <h2>Development Instructions</h2>
        <ul>
          <li>
            Create new display components in <code>src/components/</code>
          </li>
          <li>Components will be rendered at 800x480 (5:3 aspect ratio)</li>
          <li>Use the selector above to preview different components</li>
          <li>
            Run <code>npm run generate</code> to export the current view to an image
          </li>
          <li>Optimized for 6-color E-Ink: Black, White, Red, Yellow, Blue, Green</li>
        </ul>
      </div>
    </div>
  )
}

export default App
