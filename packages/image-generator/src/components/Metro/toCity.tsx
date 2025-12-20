import { buildTTAPIURL } from './api'
import { format, toZonedTime } from 'date-fns-tz'
import { differenceInMinutes } from 'date-fns'

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

export function TrainsToCity() {
  const times = timesResource.read()

  console.log(times)

  const colorMap = {
    good: '#88E788',
    minor: '#FFB27F',
    major: '#FF746C',
    cancel: '#353E43',
  }
  return times.map((time: Departures) => (
    <div className="station-container">
      <span>{time.estimated} min</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="50"
        fill={colorMap.good}
        className="bi bi-bus-front"
        viewBox="0 0 16 16"
      >
        <path d="M5 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0m8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-6-1a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zm1-6c-1.876 0-3.426.109-4.552.226A.5.5 0 0 0 3 4.723v3.554a.5.5 0 0 0 .448.497C4.574 8.891 6.124 9 8 9s3.426-.109 4.552-.226A.5.5 0 0 0 13 8.277V4.723a.5.5 0 0 0-.448-.497A44 44 0 0 0 8 4m0-1c-1.837 0-3.353.107-4.448.22a.5.5 0 1 1-.104-.994A44 44 0 0 1 8 2c1.876 0 3.426.109 4.552.226a.5.5 0 1 1-.104.994A43 43 0 0 0 8 3" />
        <path d="M15 8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1V2.64c0-1.188-.845-2.232-2.064-2.372A44 44 0 0 0 8 0C5.9 0 4.208.136 3.064.268 1.845.408 1 1.452 1 2.64V4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v3.5c0 .818.393 1.544 1 2v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V14h6v1.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2c.607-.456 1-1.182 1-2zM8 1c2.056 0 3.71.134 4.822.261.676.078 1.178.66 1.178 1.379v8.86a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5V2.64c0-.72.502-1.301 1.178-1.379A43 43 0 0 1 8 1" />
      </svg>

      <span className="padded-span-sm" style={{ backgroundColor: colorMap.good }}>
        Good Service
      </span>
      <div className="flex-row">
        <img src="box-arrow-right.svg" height={20} />
        <span>{time.scheduled}</span>
      </div>
    </div>
  ))
}
