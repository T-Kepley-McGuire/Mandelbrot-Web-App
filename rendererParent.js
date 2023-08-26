import { initializeShader, runShader } from "./compute.js";
import { render } from "./renderer.js";
import {maxIterations} from "./index.js";

async function main() {
  const metaData = {
    pixelWidth: 2560,
    pixelHeight: 1440,
  };

  const centerX = -0.8885416810711224;
  const centerY = -0.10506944739156299;
  const magnification = 1 / 0.05;
  const range = 1.7;
  const lowerX = centerX - range / magnification;
  const upperX = centerX + range / magnification;
  const lowerY =
    centerY -
    (range * (metaData.pixelHeight / metaData.pixelWidth)) / magnification;
  const upperY =
    centerY +
    (range * (metaData.pixelHeight / metaData.pixelWidth)) / magnification;

  const rangeData = {
    x0: lowerX,
    y0: lowerY,
    x1: upperX,
    y1: upperY,
  };

  const unrolledDataLength = metaData.pixelHeight * metaData.pixelWidth;
  const unrolledCoords = new Float32Array(2 * unrolledDataLength);
  for (let i = 0; i < unrolledDataLength; i++) {
    const indexCoordinates = getCoordinatesForIndex(
      rangeData,
      metaData.pixelWidth,
      metaData.pixelHeight,
      i
    );
    unrolledCoords[2 * i] = indexCoordinates.x;
    unrolledCoords[2 * i + 1] = indexCoordinates.y;
  }

  await initializeShader();
  let iterationsData = await runShader(unrolledCoords);
  const newData = getColors(iterationsData);
  const colorData = new Uint8ClampedArray(iterationsData.length * 4);
  const renderColor = { r: 50, g: 150, b: 255 };
  for (let i = 0; i < iterationsData.length; i++) {
    colorData[4 * i] = renderColor.r * newData[i];
    colorData[4 * i + 1] = renderColor.g * newData[i];
    colorData[4 * i + 2] = renderColor.b * newData[i];
    colorData[4 * i + 3] = 255;
  }
  render(metaData, colorData);
}

function getCoordinatesForIndex(
  { x0, y0, x1, y1 },
  numStepsRight,
  numStepsDown,
  currentIndex
) {
  // Calculate the row and column indices
  const rowIndex = Math.floor(currentIndex / numStepsRight);
  const colIndex = currentIndex % numStepsRight;

  const horizontalPercentage = colIndex / numStepsRight;
  const verticalPercentage = rowIndex / numStepsDown;

  const x = x0 + horizontalPercentage * (x1 - x0);
  const y = y0 + verticalPercentage * (y1 - y0);

  return { x, y };
}

function getColors(pixelIters) {
  const histogram = Array(pixelIters.length).fill(0);
  for (let i = 0; i < histogram.length; i++) {
    let index = pixelIters[i];
    if (index !== 1000) {
      histogram[index] += 1;
    }
  }
  let total = 0;
  for (let i = 0; i < histogram.length; i++) {
    total += histogram[i];
  }
  const divdHist = new Array(histogram.length).fill(0);
  divdHist[0] = histogram[0] / total;
  for (let i = 1; i < divdHist.length; i++) {
    divdHist[i] = divdHist[i - 1] + histogram[i] / total;
  }

  const setColor = new Array(pixelIters.length).fill(0);
  for (let i = 0; i < pixelIters.length; i++) {
    const iteration = pixelIters[i];
    setColor[i] = divdHist[iteration];
    if (iteration === 1000) setColor[i] = 0;
  }

  return setColor;
}

main();
