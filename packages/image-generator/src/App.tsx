import { Container, HStack } from '@chakra-ui/react'
import DisplayPreview from './components/DisplayPreview'
import MetroStatus from './components/Metro/MetroStatus'
import MetroNeoStatus from './components/MetroNeo/MetroNeoStatus'

function App() {
  return (
    <Container maxW="container.xl" display={'flex'} justifyContent={'center'}>
      <HStack gap={8} align="stretch">
        <DisplayPreview size="sm">
          <MetroNeoStatus />
        </DisplayPreview>
        <DisplayPreview size="lg">
          <MetroStatus />
        </DisplayPreview>
      </HStack>
    </Container>
  )
}

export default App
