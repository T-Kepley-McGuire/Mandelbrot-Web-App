export async function render({ pixelWidth, pixelHeight }, pixelArray) {
  if (!(pixelArray instanceof Uint8ClampedArray)) {
    throw Error("pixel array must be of type Uint8ClampedArray");
  }
  const canvas = document.querySelector("#display");
  const container = document.querySelector("#display-container");
  const context = canvas.getContext("2d");

  // Initialize a new ImageData object
  const imageData = new ImageData(pixelArray, pixelWidth, pixelHeight);

  const imageBitmap = await createImageBitmap(imageData);

  // Draw image data to the canvas
  const width = container.clientWidth;
  canvas.width = width;
  canvas.height = (width * pixelHeight) / pixelWidth;

  context.drawImage(
    imageBitmap,
    0,
    0,
    width,
    (width * pixelHeight) / pixelWidth
  );
}
