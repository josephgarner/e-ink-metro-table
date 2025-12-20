import { Suspense } from 'react'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import { TrainsToCityNeo } from './ToCityNeo'
import ErrorBoundary from '../ErrorBoundary'

function MetroNeoStatus() {
  return (
    <Box
      w="100%"
      h="100%"
      bg="brutal.white"
      p={4}
      fontFamily="'Inter', -apple-system, system-ui, sans-serif"
      fontWeight="bold"
    >
      <VStack gap={4} align="stretch" h="100%">
        {/* Route Header: Home -> Flinders */}
        <HStack gap={4} justify="center" align="center">
          <Box
            bg="brutal.black"
            color="brutal.white"
            px={6}
            py={3}
            border="4px solid black"
            borderRadius="0"
            boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
          >
            <Text fontSize="xl" fontWeight="black" textTransform="uppercase">
              Home
            </Text>
          </Box>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
            />
          </svg>

          <Box
            bg="brutal.yellow"
            color="brutal.black"
            px={6}
            py={3}
            border="4px solid black"
            borderRadius="0"
            boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
          >
            <Text fontSize="xl" fontWeight="black" textTransform="uppercase">
              Flinders
            </Text>
          </Box>
        </HStack>

        {/* Train Times Row */}
        <HStack gap={4} flex="1" align="stretch">
          <ErrorBoundary>
            <Suspense
              fallback={
                <Box
                  border="4px solid black"
                  borderRadius="0"
                  boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
                  p={8}
                  bg="brutal.yellow"
                  flex="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="lg" fontWeight="black" textTransform="uppercase">
                    Loading trains...
                  </Text>
                </Box>
              }
            >
              <TrainsToCityNeo />
            </Suspense>
          </ErrorBoundary>
        </HStack>

        {/* Route Header: Flinders <- Home */}
        <HStack gap={4} justify="center" align="center">
          <Box
            bg="brutal.yellow"
            color="brutal.black"
            px={6}
            py={3}
            border="4px solid black"
            borderRadius="0"
            boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
          >
            <Text fontSize="xl" fontWeight="black" textTransform="uppercase">
              Home
            </Text>
          </Box>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
            />
          </svg>

          <Box
            bg="brutal.black"
            color="brutal.white"
            px={6}
            py={3}
            border="4px solid black"
            borderRadius="0"
            boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
          >
            <Text fontSize="xl" fontWeight="black" textTransform="uppercase">
              Flinders
            </Text>
          </Box>
        </HStack>
      </VStack>
    </Box>
  )
}

export default MetroNeoStatus
