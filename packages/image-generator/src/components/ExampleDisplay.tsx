import './ExampleDisplay.css'

/**
 * ExampleDisplay component
 * A sample display layout showcasing the 6 colors available on the E-Ink Spectra 6 display
 * Colors: Black, White, Red, Yellow, Blue, Green
 */
function ExampleDisplay() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="example-display">
      <header className="example-header">
        <h1 className="example-title">E-Ink Display</h1>
        <div className="example-date">{currentDate}</div>
        <div className="example-time">{currentTime}</div>
      </header>

      <div className="example-content">
        <section className="color-showcase">
          <h2>Available Colors</h2>
          <div className="color-grid">
            <div className="color-box black">
              <span>Black</span>
            </div>
            <div className="color-box red">
              <span>Red</span>
            </div>
            <div className="color-box yellow">
              <span>Yellow</span>
            </div>
            <div className="color-box blue">
              <span>Blue</span>
            </div>
            <div className="color-box green">
              <span>Green</span>
            </div>
            <div className="color-box white">
              <span>White</span>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="info-card blue-card">
            <h3>Weather</h3>
            <p className="big-text">72°F</p>
            <p>Partly Cloudy</p>
          </div>

          <div className="info-card green-card">
            <h3>Status</h3>
            <p className="big-text">✓</p>
            <p>System Online</p>
          </div>

          <div className="info-card red-card">
            <h3>Alerts</h3>
            <p className="big-text">0</p>
            <p>No notifications</p>
          </div>
        </section>
      </div>

      <footer className="example-footer">
        <p>Powered by XIAO ESP32-S3 | 7.3" E-Ink Spectra 6</p>
      </footer>
    </div>
  )
}

export default ExampleDisplay
