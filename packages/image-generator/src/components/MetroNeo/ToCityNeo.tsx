import { buildTTAPIURL } from '../Metro/api'
import { format, toZonedTime } from 'date-fns-tz'
import { differenceInMinutes } from 'date-fns'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'

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
    '/v3/departures/route_type/0/stop/1097?direction_id=1&max_results=4&include_cancelled=true'
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

export function TrainsToCityNeo() {
  const times = timesResource.read()

  const colorMap = {
    good: '#00FF00',
    minor: '#FFFF00',
    major: '#FF0000',
    cancel: '#353E43',
  }

  const getStatusColor = (disruptions: string[]) => {
    if (disruptions.length === 0) return colorMap.good
    return colorMap.minor
  }

  return times.map((time: Departures, idx: number) => (
    <Box
      key={idx}
      border="4px solid black"
      borderRadius="0"
      boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
      p={3}
      bg="brutal.white"
      flex="1"
    >
      <VStack gap={2} align="stretch">
        {/* Minutes until departure */}
        <Text fontSize="2xl" fontWeight="black" textAlign="center" color="brutal.black">
          {time.estimated} MIN
        </Text>

        {/* Train icon */}
        <Box display="flex" justifyContent="center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="50"
            fill={getStatusColor(time.disruption_ids)}
            viewBox="0 0 16 16"
          >
            <path d="M5 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0m8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-6-1a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zm1-6c-1.876 0-3.426.109-4.552.226A.5.5 0 0 0 3 4.723v3.554a.5.5 0 0 0 .448.497C4.574 8.891 6.124 9 8 9s3.426-.109 4.552-.226A.5.5 0 0 0 13 8.277V4.723a.5.5 0 0 0-.448-.497A44 44 0 0 0 8 4m0-1c-1.837 0-3.353.107-4.448.22a.5.5 0 1 1-.104-.994A44 44 0 0 1 8 2c1.876 0 3.426.109 4.552.226a.5.5 0 1 1-.104.994A43 43 0 0 0 8 3" />
            <path d="M15 8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1V2.64c0-1.188-.845-2.232-2.064-2.372A44 44 0 0 0 8 0C5.9 0 4.208.136 3.064.268 1.845.408 1 1.452 1 2.64V4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v3.5c0 .818.393 1.544 1 2v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V14h6v1.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2c.607-.456 1-1.182 1-2zM8 1c2.056 0 3.71.134 4.822.261.676.078 1.178.66 1.178 1.379v8.86a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5V2.64c0-.72.502-1.301 1.178-1.379A43 43 0 0 1 8 1" />
          </svg>
        </Box>

        {/* Status badge */}
        <Box
          bg={getStatusColor(time.disruption_ids)}
          color="brutal.black"
          p={2}
          textAlign="center"
          border="3px solid black"
          borderRadius="0"
        >
          <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">
            {time.disruption_ids.length === 0 ? 'Good Service' : 'Minor Delays'}
          </Text>
        </Box>

        {/* Scheduled time */}
        <HStack gap={2} justify="center" border="3px solid black" borderRadius="0" p={2} bg="brutal.white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
            />
          </svg>
          <Text fontWeight="bold" fontSize="md">
            {time.scheduled}
          </Text>
        </HStack>
      </VStack>
    </Box>
  ))
}
