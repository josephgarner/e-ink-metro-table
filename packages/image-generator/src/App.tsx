import { Container, HStack } from '@chakra-ui/react'
import DisplayPreview from './components/DisplayPreview'
import MetroPixelStatus from './components/MetroPixel/MetroPixelStatus'

function App() {
  return (
    <Container maxW="container.xl" display={'flex'} justifyContent={'center'}>
      <HStack gap={8} align="stretch">
        <DisplayPreview size="sm">
          <MetroPixelStatus />
        </DisplayPreview>
      </HStack>
    </Container>
  )
}

export default App
