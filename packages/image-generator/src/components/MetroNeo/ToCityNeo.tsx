import { buildTTAPIURL } from '../../service/api'
import { format, toZonedTime } from 'date-fns-tz'
import { differenceInMinutes } from 'date-fns'
import { Box, HStack, VStack, Text, Icon } from '@chakra-ui/react'
import { FaClock } from 'react-icons/fa'
import { MdOutlineTrain } from 'react-icons/md'
import StatusBox from './StatusBox'

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

export function TrainsToCityNeo({ status }: ToCityProps) {
  const times = timesResource.read()

  return (
    <VStack w="100%" alignItems="stretch">
      {times.map((time: Departures, idx: number) => (
        <Box
          key={idx}
          border="4px solid black"
          borderRadius="0"
          boxShadow="5px 5px 0px 0px rgba(0, 0, 0, 1)"
          p={3}
          bg="brutal.white"
          flex="1"
        >
          <HStack gap={2} align="stretch" justify="space-between">
            {/* Minutes until departure */}
            <HStack
              gap={2}
              justify="center"
              border="3px solid black"
              borderRadius="0"
              p={2}
              bg="brutal.black"
            >
              <Icon size="2xl" color="white">
                <FaClock />
              </Icon>
              <Text fontWeight="bold" fontSize="md">
                {time.scheduled}
              </Text>
            </HStack>

            {/* Train icon */}
            <Box display="flex" alignItems="center">
              <Icon fontSize={42} color="Black">
                <MdOutlineTrain />
              </Icon>
            </Box>

            {/* Status badge */}
            <StatusBox status={status} />

            <Box display="flex" alignItems="center">
              <Text fontSize="md" fontWeight="black" textAlign="center" color="brutal.black">
                {time.estimated} MIN
              </Text>
            </Box>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}
