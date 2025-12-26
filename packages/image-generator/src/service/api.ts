/**
 * Method to demonstrate building of Timetable API URL
 *
 * @param uri - Request URI with parameters (Example: /v2/mode/0/line/8/stop/1104/directionid/0/departures/all/limit/5?for_utc=2014-08-15T06:18:08Z)
 * @returns Complete URL with signature
 */
export async function buildTTAPIURL(uri: string): Promise<string> {
  const HMAC_SHA1_ALGORITHM = 'SHA-1'
  const baseURL = import.meta.env.VITE_METRO_API
  const privateKey = import.meta.env.VITE_API_KEY
  const developerId = import.meta.env.VITE_DEV_ID

  // Append developer ID to URI (this is what we sign)
  const uriWithDeveloperID = `${uri}${uri.includes('?') ? '&' : '?'}devid=${developerId}`

  // Convert to bytes
  const encoder = new TextEncoder()
  const keyBytes = encoder.encode(privateKey)
  const uriBytes = encoder.encode(uriWithDeveloperID)

  // Import the key for HMAC
  const signingKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: HMAC_SHA1_ALGORITHM },
    false,
    ['sign']
  )

  // Generate signature
  const signatureBuffer = await crypto.subtle.sign('HMAC', signingKey, uriBytes)
  const signatureBytes = new Uint8Array(signatureBuffer)

  // Convert signature to uppercase hex string
  const signature = Array.from(signatureBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

  // Build final URL
  const url = `${baseURL}${uriWithDeveloperID}&signature=${signature}`

  return url
}
