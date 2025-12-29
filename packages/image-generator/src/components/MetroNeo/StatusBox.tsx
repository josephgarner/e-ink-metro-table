import { Box, Text } from '@chakra-ui/react'

export default function StatusBox({ status }: { status: string }) {
  // Neobrutalism color palette optimized for E-Ink display
  const colorMap = {
    good: '#00FF00',      // Green - good service
    minor: '#FFFF00',     // Yellow - minor delays
    major: '#FF0000',     // Red - major delays
    cancelled: '#0000FF', // Blue - service cancelled
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

  return (
    <Box
      bg={getStatusColor(status)}
      color="brutal.black"
      display="flex"
      p={2}
      textAlign="center"
      border="3px solid black"
      borderRadius="0"
      alignItems="center"
    >
      <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">
        {status}
      </Text>
    </Box>
  )
}
