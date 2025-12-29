import { Box, Text } from '@chakra-ui/react'

export default function StatusBox({ status }: { status: string }) {
  const colorMap = {
    good: '#00FF00',
    minor: '#FFFF00',
    major: '#FF0000',
    cancel: '#353E43',
  }

  const getStatusColor = (status: string) => {
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
