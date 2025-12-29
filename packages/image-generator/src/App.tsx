import { Container, HStack } from '@chakra-ui/react'
import DisplayPreview from './components/DisplayPreview'
import MetroNeoStatus from './components/MetroNeo/MetroNeoStatus'

function App() {
  return (
    <Container maxW="container.xl" display={'flex'} justifyContent={'center'}>
      <HStack gap={8} align="stretch">
        <DisplayPreview size="sm">
          <MetroNeoStatus />
        </DisplayPreview>
      </HStack>
    </Container>
  )
}

export default App
