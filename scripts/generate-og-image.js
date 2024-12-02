import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateOGImage() {
  try {
    // Convert SVG to PNG using Node.js
    await execAsync('npx svgexport public/og-image.svg public/og-image.png 1x');
    console.log('OG image generated successfully!');
  } catch (error) {
    console.error('Error generating OG image:', error);
    process.exit(1);
  }
}

generateOGImage();