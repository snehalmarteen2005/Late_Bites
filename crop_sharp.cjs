const sharp = require('sharp');
const path = require('path');

const src = "C:\\Users\\denny\\.gemini\\antigravity\\brain\\a096ddfb-6c59-4f3d-8d2d-388c1d30380a\\media__1775844071877.jpg";
const dest = path.join(__dirname, 'public', 'logo.png');

async function processImage() {
  try {
    const metadata = await sharp(src).metadata();
    const size = Math.min(metadata.width, metadata.height);
    
    // Create a circular SVG mask
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>`
    );

    // Extract the center square
    const imgBuf = await sharp(src)
      .extract({
        left: Math.floor((metadata.width - size) / 2),
        top: Math.floor((metadata.height - size) / 2),
        width: size,
        height: size
      })
      .toBuffer();

    // Mask the square with a circle to get transparent corners
    await sharp(imgBuf)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(dest);
      
    console.log("Successfully created perfectly circular logo.png with transparent background.");
  } catch (err) {
    console.error("Error with sharp:", err);
  }
}
processImage();
