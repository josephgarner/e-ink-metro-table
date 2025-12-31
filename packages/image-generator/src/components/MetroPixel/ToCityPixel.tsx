import { buildTTAPIURL } from '../../service/api'
import { format, toZonedTime } from 'date-fns-tz'
import { differenceInMinutes } from 'date-fns'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import StatusBoxPixel from './StatusBoxPixel'

type Departures = {
  scheduled: string
  estimated: number
  disruption_ids: string[]
}

// Create a resource that Suspense can work with
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

async function fetchTimes() {
  const apiURL = await buildTTAPIURL(
    '/v3/departures/route_type/0/stop/1097?direction_id=1&max_results=3&include_cancelled=true'
  )
  const res = await fetch(apiURL)
  const data = await res.json()
  return data.departures.map((d: any) => {
    // Convert UTC to Melbourne timezone
    const utcDate = new Date(d.scheduled_departure_utc)
    const melbourneDate = toZonedTime(utcDate, 'Australia/Melbourne')

    // Get current time in Melbourne timezone
    const now = toZonedTime(new Date(), 'Australia/Melbourne')

    // Calculate minutes until departure
    const minutesUntil = differenceInMinutes(melbourneDate, now)

    return {
      scheduled: format(melbourneDate, 'hh:mmaaa'),
      estimated: minutesUntil,
      disruption_ids: d.disruption_ids,
    }
  })
}

// Create the resource outside the component
const timesResource = wrapPromise(fetchTimes())

interface ToCityProps {
  status: string
}

export function TrainsToCityPixel({ status }: ToCityProps) {
  const times = timesResource.read()

  return (
    <VStack w="100%" alignItems="stretch" gap={2}>
      {times.map((time: Departures, idx: number) => (
        <Box
          key={idx}
          border="pixel"
          boxShadow="pixel.inset"
          p={2}
          bg="pixel.lightest"
          flex="1"
        >
          <HStack gap={2} align="center" justify="space-between">
            {/* Time */}
            <HStack
              gap={2}
              justify="center"
              border="pixel"
              boxShadow="pixel.insetDark"
              px={2}
              py={1}
              bg="pixel.dark"
            >
              <Text fontSize="2xs" color="pixel.lightest">
                ⏰
              </Text>
              <Text fontSize="2xs" color="pixel.lightest">
                {time.scheduled}
              </Text>
            </HStack>

            {/* Pixel Train Icon */}
            <Text fontSize="md" color="pixel.darkest">
              🚂
            </Text>

            {/* Status */}
            <StatusBoxPixel status={status} />

            {/* Minutes */}
            <Box
              border="pixel"
              px={2}
              py={1}
              bg="pixel.background"
              minW="60px"
              textAlign="center"
            >
              <Text fontSize="2xs" color="pixel.darkest">
                {time.estimated}m
              </Text>
            </Box>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}
