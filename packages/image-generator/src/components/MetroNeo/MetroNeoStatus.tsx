import { Suspense } from 'react'
import { Box, HStack, VStack, Text, Icon } from '@chakra-ui/react'
import { FaLongArrowAltRight, FaLongArrowAltLeft } from 'react-icons/fa'
import { TrainsToCityNeo } from './ToCityNeo'
import ErrorBoundary from '../ErrorBoundary'
import { TrainsFromCityNeo } from './FromCityNeo'
import { buildTTAPIURL } from '@/service/api'

async function fetchStatus() {
  const apiURL = await buildTTAPIURL('/v3/routes/16')
  const res = await fetch(apiURL)
  const data = await res.json()
  return {
    status: data.route.route_service_status.description,
  }
}

function wrapPromise<T>(promise: Promise<T>) {
  let status = 'pending'
  let result: T
  let suspender = promise.then(
    (r) => {
      status = 'success'
      result = r
    },
    (e) => {
      status = 'error'
      result = e
    }
  )

  return {
    read() {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw result
      } else if (status === 'success') {
        return result
      }
    },
  }
}

// Create the resource outside the component
const statusResource = wrapPromise(fetchStatus())

function MetroNeoStatus() {
  const status = statusResource.read()

  return (
    <Box
      w="100%"
      h="100%"
      bg="brutal.white"
      p={4}
      fontFamily="'Inter', -apple-system, system-ui, sans-serif"
      fontWeight="bold"
    >
      <VStack gap={4} align="stretch" h="100%" w="100%">
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

          <Icon size="2xl" color="black">
            <FaLongArrowAltRight />
          </Icon>

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
        <HStack gap={4} flex="1" w="100%">
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
              <TrainsToCityNeo status={status?.status} />
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

          <Icon size="2xl" color="black">
            <FaLongArrowAltLeft />
          </Icon>
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
        <HStack gap={4} flex="1">
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
              <TrainsFromCityNeo status={status?.status} />
            </Suspense>
          </ErrorBoundary>
        </HStack>
      </VStack>
    </Box>
  )
}

export default MetroNeoStatus
