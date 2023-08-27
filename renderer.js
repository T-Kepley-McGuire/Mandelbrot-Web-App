export async function render(canvas, context, { pixelWidth, pixelHeight }, pixelArray) {
  if (!(pixelArray instanceof Uint8ClampedArray)) {
    throw Error("pixel array must be of type Uint8ClampedArray");
  }
  

  // Initialize a new ImageData object
  const imageData = new ImageData(pixelArray, pixelWidth, pixelHeight);

  const imageBitmap = await createImageBitmap(imageData);

  // Draw image data to the canvas
  const width =  canvas.width; //container.clientWidth;
  //canvas.width = width;
  //canvas.height = (width * pixelHeight) / pixelWidth;
  // context.translate( canvas.width / 2, canvas.height / 2 ); 
  // context.rotate( Math.PI / 2 );
  // context.translate( -canvas.width / 2, -canvas.height / 2 ); 

  context.drawImage(
    imageBitmap,
    0,
    0,
    width,
    (width * pixelHeight) / pixelWidth
  );
}
