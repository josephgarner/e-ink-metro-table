import { Suspense } from 'react'
import '@hackernoon/pixel-icon-library/fonts/iconfont.css'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import { TrainsToCityPixel } from './ToCityPixel'
import ErrorBoundary from '../ErrorBoundary'
import { TrainsFromCityPixel } from './FromCityPixel'
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

function MetroPixelStatus() {
  const status = statusResource.read()

  return (
    <Box w="100%" h="100%" bg="pixel.background" p={3}>
      <VStack gap={3} align="stretch" h="100%" w="100%">
        {/* Route Header: Home -> Flinders */}
        <HStack gap={3} justify="center" align="center">
          <Box
            bg="pixel.dark"
            color="pixel.lightest"
            px={4}
            py={2}
            border="pixel"
            boxShadow="pixel.insetDark"
          >
            <Text fontSize="xs" textTransform="uppercase">
              Home
            </Text>
          </Box>

          <Text fontSize="xl" color="pixel.darkest">
            ▶
          </Text>

          <Box
            bg="pixel.light"
            color="pixel.darkest"
            px={4}
            py={2}
            border="pixel"
            boxShadow="pixel.inset"
          >
            <Text fontSize="xs" textTransform="uppercase">
              Flinders
            </Text>
          </Box>
        </HStack>

        {/* Train Times Row */}
        <HStack gap={3} flex="1" w="100%">
          <ErrorBoundary>
            <Suspense
              fallback={
                <Box
                  border="pixel"
                  boxShadow="pixel.inset"
                  p={6}
                  bg="pixel.lightest"
                  flex="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xs">LOADING...</Text>
                </Box>
              }
            >
              <TrainsToCityPixel status={status?.status} />
            </Suspense>
          </ErrorBoundary>
        </HStack>

        {/* Route Header: Flinders <- Home */}
        <HStack gap={3} justify="center" align="center">
          <Box
            bg="pixel.light"
            color="pixel.darkest"
            px={4}
            py={2}
            border="pixel"
            boxShadow="pixel.inset"
          >
            <Text fontSize="xs" textTransform="uppercase">
              Home
            </Text>
          </Box>

          <Text fontSize="xl" color="pixel.darkest">
            ◀
          </Text>

          <Box
            bg="pixel.dark"
            color="pixel.lightest"
            px={4}
            py={2}
            border="pixel"
            boxShadow="pixel.insetDark"
          >
            <Text fontSize="xs" textTransform="uppercase">
              Flinders
            </Text>
          </Box>
        </HStack>

        <HStack gap={3} flex="1">
          <ErrorBoundary>
            <Suspense
              fallback={
                <Box
                  border="pixel"
                  boxShadow="pixel.inset"
                  p={6}
                  bg="pixel.lightest"
                  flex="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xs">LOADING...</Text>
                </Box>
              }
            >
              <TrainsFromCityPixel status={status?.status} />
            </Suspense>
          </ErrorBoundary>
        </HStack>
      </VStack>
    </Box>
  )
}

export default MetroPixelStatus
