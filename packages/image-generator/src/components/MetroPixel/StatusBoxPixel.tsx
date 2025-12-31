import { Box, Text } from '@chakra-ui/react'

export default function StatusBoxPixel({ status }: { status: string }) {
  // Game Boy inspired color palette using theme tokens
  const colorMap = {
    good: 'pixel.blue', // Light green - good service
    minor: 'pixel.yellow', // Lightest green - minor delays
    major: 'pixel.red', // Dark green - major delays
    cancelled: 'pixel.purple', // Darkest green - service cancelled
  }

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase()

    // Check for cancelled/suspended first
    if (statusLower.includes('cancelled') || statusLower.includes('suspended')) {
      return colorMap.cancelled
    }

    // Check for major delays
    if (statusLower.includes('major')) {
      return colorMap.major
    }

    // Check for minor delays
    if (statusLower.includes('minor')) {
      return colorMap.minor
    }

    // Default to good service
    return colorMap.good
  }

  const getStatusIcon = (status: string): string => {
    const statusLower = status.toLowerCase()

    // Check for cancelled/suspended first
    if (statusLower.includes('cancelled') || statusLower.includes('suspended')) {
      return 'hn hn-times'
    }

    // Check for major delays
    if (statusLower.includes('major')) {
      return 'hn hn-exclamation-triangle'
    }

    // Check for minor delays
    if (statusLower.includes('minor')) {
      return 'hn hn-bell'
    }

    // Default to good service
    return 'hn hn-badge-check'
  }

  const getTextColor = (bg: string): string => {
    // Dark backgrounds get light text, light backgrounds get dark text
    if (bg === colorMap.cancelled || bg === colorMap.major) {
      return 'pixel.lightest'
    }
    return 'pixel.darkest'
  }

  const bgColor = getStatusColor(status)
  const textColor = getTextColor(bgColor)
  const icon = getStatusIcon(status)

  return (
    <Box
      bg={bgColor}
      color={textColor}
      display="flex"
      justifyContent={'space-between'}
      justifyItems={'center'}
      px={2}
      py={1}
      textAlign="center"
      border="pixel"
      alignItems="center"
      flex="1"
      maxW="200px"
    >
      <Text fontSize="md">
        <i className={icon} style={{ lineHeight: 1.5 }}></i>
      </Text>
      <Text fontSize="md" textTransform="uppercase">
        {status}
      </Text>
    </Box>
  )
}
