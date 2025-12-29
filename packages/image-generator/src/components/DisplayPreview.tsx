import { ReactNode } from 'react'
import { AspectRatio } from '@chakra-ui/react'

interface DisplayPreviewProps {
  children: ReactNode
  size: 'sm' | 'lg'
}

/**
 * DisplayPreview component
 * Wraps the display component with a preview container that shows
 * the exact dimensions of the E-Ink display (800x480)
 */
function DisplayPreview({ size, children }: DisplayPreviewProps) {
  const height = size === 'sm' ? 800 : 1040
  const width = size === 'sm' ? 480 : 624
  return (
    <AspectRatio ratio={3 / 5} height={height} width={width} id="display-content">
      {children}
    </AspectRatio>
  )
}

export default DisplayPreview
