import { launch } from 'puppeteer'
import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const DISPLAY_WIDTH = parseInt(process.env.DISPLAY_WIDTH || '800')
const DISPLAY_HEIGHT = parseInt(process.env.DISPLAY_HEIGHT || '480')
const OUTPUT_FILENAME = process.env.OUTPUT_FILENAME || 'display.png'
const FILE_STORE_PATH = process.env.FILE_STORE_PATH || './output'

// Get component name from command line argument or environment variable
const COMPONENT = process.argv[2] || process.env.COMPONENT || 'metro'

/**
 * Generate an image from the current display component
 * This script uses Puppeteer to render the React app and capture a screenshot
 */
async function generateImage() {
  console.log('Starting image generation...')
  console.log(`Component: ${COMPONENT}`)
  console.log(`Output dimensions: ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}`)
  console.log(`Output path: ${FILE_STORE_PATH}/${OUTPUT_FILENAME}`)

  // Ensure output directory exists
  if (!fs.existsSync(FILE_STORE_PATH)) {
    fs.mkdirSync(FILE_STORE_PATH, { recursive: true })
    console.log(`Created output directory: ${FILE_STORE_PATH}`)
  }

  const browser = await launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )

    // Listen for console messages and errors
    page.on('console', (msg) => console.log('Browser console:', msg.text()))
    page.on('pageerror', (error) => console.error('Page error:', error.message))

    // Set viewport to exact display dimensions
    await page.setViewport({
      width: DISPLAY_WIDTH,
      height: DISPLAY_HEIGHT,
      deviceScaleFactor: 1,
    })

    // Navigate to the local dev server or built version
    // You'll need to have the app running or built first
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    console.log(`Loading app from: ${appUrl}`)

    await page.goto(appUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Debug: log page content
    const pageContent = await page.content()
    console.log('Page loaded, checking for elements...')

    // Wait for the display content to be present first
    const displayExists = await page.$('#display-content')
    if (!displayExists) {
      console.error('Could not find #display-content. Page content length:', pageContent.length)
      // Save debug screenshot
      await page.screenshot({ path: './debug-screenshot.png' })
      throw new Error('Could not find #display-content element on initial load')
    }

    // Select the component from the dropdown
    await page.select('#component-select', COMPONENT)
    console.log(`Selected component: ${COMPONENT}`)

    // Wait for component to render and any async data to load
    // networkidle0 waits for network requests (like API calls) to complete
    await page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {
      console.log('Network idle timeout - continuing anyway')
    })

    // Additional wait for Suspense boundaries to resolve
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Find the display content element
    const displayElement = await page.$('#display-content')

    if (!displayElement) {
      throw new Error('Could not find #display-content element')
    }

    // Take screenshot of just the display content
    const outputPath = path.join(FILE_STORE_PATH, OUTPUT_FILENAME)
    await displayElement.screenshot({
      path: outputPath,
      omitBackground: false,
    })

    console.log(`✓ Image generated successfully: ${outputPath}`)
    console.log(`  Size: ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}px`)

    // Get file size
    const stats = fs.statSync(outputPath)
    console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Run the generator
generateImage()
  .then(() => {
    console.log('\nImage generation complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nImage generation failed:', error)
    process.exit(1)
  })
