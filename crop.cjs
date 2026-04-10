const path = require('path');

async function processImage() {
  let Jimp;
  try {
    Jimp = require('jimp');
  } catch (e) {
    // If jimp isn't available, we'll try sharp or something else if needed
    console.error("Jimp not installed yet.");
    process.exit(1);
  }
  
  const src = "C:\\Users\\denny\\.gemini\\antigravity\\brain\\a096ddfb-6c59-4f3d-8d2d-388c1d30380a\\media__1775844071877.jpg";
  const dest = path.join(__dirname, 'public', 'logo.png');

  try {
    const image = await Jimp.read(src);
    
    // The image has a white circle on a black background.
    // The white circle seems to touch the edges horizontally.
    const size = Math.min(image.bitmap.width, image.bitmap.height);
    
    // Crop center square
    const x = (image.bitmap.width - size) / 2;
    const y = (image.bitmap.height - size) / 2;
    image.crop(x, y, size, size);
    
    // Make the corners transparent (masking the circle)
    image.circle();
    
    await image.writeAsync(dest);
    console.log("Successfully created logo.png");
  } catch(err) {
    console.error("Error processing image:", err);
  }
}

processImage();
