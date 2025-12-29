import { launch } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config';

export class ImageGeneratorService {
  private appUrl: string;
  private outputPath: string;
  private fileStoreUrl: string;
  private displayWidth: number;
  private displayHeight: number;

  constructor() {
    this.appUrl = config.imageGenerator.appUrl;
    this.outputPath = config.imageGenerator.outputPath;
    this.fileStoreUrl = config.imageGenerator.fileStoreUrl;
    this.displayWidth = config.imageGenerator.displayWidth;
    this.displayHeight = config.imageGenerator.displayHeight;
  }

  async triggerImageGeneration(): Promise<void> {
    console.log('Starting image generation...');
    console.log(`Output dimensions: ${this.displayWidth}x${this.displayHeight}`);
    console.log(`Output path: ${this.outputPath}`);

    // Ensure output directory exists
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }

    const browser = await launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      // Listen for console messages and errors
      page.on('console', (msg) => console.log('Browser console:', msg.text()));
      page.on('pageerror', (error) => console.error('Page error:', error.message));

      // Set viewport to exact display dimensions
      await page.setViewport({
        width: this.displayWidth,
        height: this.displayHeight,
        deviceScaleFactor: 1,
      });

      console.log(`Loading app from: ${this.appUrl}`);

      await page.goto(this.appUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      console.log('Page loaded, checking for elements...');

      // Wait for the display content to be present
      console.log('Waiting for #display-content element...');
      const displayElement = await page.waitForSelector('#display-content', {
        timeout: 10000,
      });

      if (!displayElement) {
        throw new Error('Could not find #display-content element');
      }

      console.log('Display content found, waiting for content to load...');

      // Wait for component to render and any async data to load
      await page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // Additional wait for Suspense boundaries to resolve
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Take screenshot of just the display content
      await displayElement.screenshot({
        path: this.outputPath,
        omitBackground: false,
      });

      console.log(`✓ Image generated successfully: ${this.outputPath}`);
      console.log(`  Size: ${this.displayWidth}x${this.displayHeight}px`);

      // Get file size
      const stats = fs.statSync(this.outputPath);
      console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`);

      // Upload to file store if configured
      if (this.fileStoreUrl) {
        await this.uploadToFileStore();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async uploadToFileStore(): Promise<void> {
    console.log(`Uploading image to file store: ${this.fileStoreUrl}`);

    try {
      // Get the filename from the output path
      const filename = path.basename(this.outputPath);

      // If it's a file path (starts with / or drive letter or //), copy the file
      if (this.fileStoreUrl.startsWith('/') ||
          this.fileStoreUrl.startsWith('\\\\') ||
          this.fileStoreUrl.match(/^[a-zA-Z]:/)) {
        // Network path or local path - use file copy
        const destinationPath = path.join(this.fileStoreUrl, filename);

        // Ensure destination directory exists
        const destDir = path.dirname(destinationPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(this.outputPath, destinationPath);
        console.log(`✓ Image uploaded to: ${destinationPath}`);
      }
      // If it's an HTTP URL, upload via PUT
      else if (this.fileStoreUrl.startsWith('http://') || this.fileStoreUrl.startsWith('https://')) {
        const fileBuffer = fs.readFileSync(this.outputPath);

        // Construct the full URL with the filename
        // e.g., http://127.0.0.1:5000/new-path/display.png
        const uploadUrl = this.fileStoreUrl.endsWith('/')
          ? `${this.fileStoreUrl}${filename}`
          : `${this.fileStoreUrl}/${filename}`;

        console.log(`Uploading to: ${uploadUrl}`);

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: fileBuffer,
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': fileBuffer.length.toString(),
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        console.log(`✓ Image uploaded to: ${uploadUrl}`);
      } else {
        console.warn(`Unsupported file store URL format: ${this.fileStoreUrl}`);
      }
    } catch (error) {
      console.error('Error uploading to file store:', error);
      throw error;
    }
  }
}
