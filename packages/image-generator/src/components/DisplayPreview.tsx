import { ReactNode } from 'react'
import './DisplayPreview.css'

interface DisplayPreviewProps {
  children: ReactNode
}

/**
 * DisplayPreview component
 * Wraps the display component with a preview container that shows
 * the exact dimensions of the E-Ink display (800x480)
 */
function DisplayPreview({ children }: DisplayPreviewProps) {
  return (
    <div className="preview-container">
      <div className="preview-info">
        <span>Preview: 800×480px (5:3 aspect ratio)</span>
      </div>
      <div className="display-frame">
        <div id="display-content" className="display-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DisplayPreview
