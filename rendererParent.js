import { initializeShader, runShader } from "./compute.js";
import { printInformation } from "./readout.js";
import { render } from "./renderer.js";

const rangeData = {
  x0: -2.2,
  y0: -1,
  x1: 1.4,
  y1: 1,
};

let magnification = 1;

let iterationCount = 1000;

const metaData = {
  pixelWidth: 2560,
  pixelHeight: 1440,
};

let color = {h: 0.54, s: 1, l: 0.5};

let iterationsData;

window.addEventListener("load", function (event) {
  run();
});

export function setIterationCount(count) {
  iterationCount = count;
}

export function setColor(newColor) {
  if(newColor) color = newColor;
  
  runRenderer();
}

export async function run(relativeCenter, relativeMagnification) {
  if(!relativeCenter || !relativeCenter.x) relativeCenter = {x: 0.5, y: 0.5}
  if(!relativeMagnification) relativeMagnification = 0; 
  const centerX =
    rangeData.x0 + (rangeData.x1 - rangeData.x0) * relativeCenter.x;
  const centerY =
    rangeData.y0 + (rangeData.y1 - rangeData.y0) * relativeCenter.y;

  const range = 1.7;

  magnification = magnification * Math.pow(2, relativeMagnification);

  rangeData.x0 = centerX - range / magnification;
  rangeData.x1 = centerX + range / magnification;
  rangeData.y0 =
    centerY -
    (range * (metaData.pixelHeight / metaData.pixelWidth)) / magnification;
  rangeData.y1 =
    centerY +
    (range * (metaData.pixelHeight / metaData.pixelWidth)) / magnification;

  const unrolledCoords = unrollCoordinates(metaData, rangeData);

  await initializeShader();
  iterationsData = await runShader(unrolledCoords, iterationCount);
  runRenderer();
  printInformation(magnification, {x: centerX, y: centerY}, iterationCount);
}

function runRenderer() {
  const canvas = document.querySelector("#display");
  const context = canvas.getContext("2d");

  const colorData = getColors(iterationsData, iterationCount);
  
  render(canvas, context, metaData, colorData);
}

function unrollCoordinates(metaData, rangeData) {
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
  return unrolledCoords;
}

function getColors(newData, iterationCount) {
  const colorData = new Uint8ClampedArray(newData.length * 4);
  const lerpedIters = new Float32Array(newData.length);
  for (let i = 0; i < newData.length; i++) {
    const l1 = Math.floor(newData[i]);
    const l2 = Math.floor(newData[i] + 1);
    lerpedIters[i] = lerp(l1, l2, newData[i] % 1);
    if (newData[i] >= iterationCount - 1) lerpedIters[i] = 0;
  }
  const cycle = 50;
  for (let i = 0; i < lerpedIters.length; i++) {
    let l = (newData[i] % cycle) / cycle;

    const c = hslToRgb(color.h, color.s, (1.1 * lerpedIters[i]) / cycle);

    colorData[4 * i] = c.r;
    colorData[4 * i + 1] = c.g;
    colorData[4 * i + 2] = c.b;
    colorData[4 * i + 3] = 255;
  }

  return colorData;
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

// function getColors(newData) {
//   const colorData = new Uint8ClampedArray(newData.length * 4);
//   for (let i = 0; i < newData.length; i++) {
//     const rgb = hslToRgb(0.54, 1, 0.9 * newData[i]);
//     colorData[4 * i] = rgb.r;
//     colorData[4 * i + 1] = rgb.g;
//     colorData[4 * i + 2] = rgb.b;
//     colorData[4 * i + 3] = 255;
//   }
//   return colorData;
// }

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
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

// function continuousHistogram(pixelIters) {
//   let total = 0;
//   let min = 1000;
//   let max = 0;
//   for (let i = 0; i < pixelIters.length; i++) {
//     if (pixelIters[i] < min) min = pixelIters[i];
//     if (pixelIters[i] > max && pixelIters[i] < iterationCount - 10)
//       max = pixelIters[i];
//     if (pixelIters[i] < iterationCount - 10) {
//       total += pixelIters[i];
//     }
//   }

//   console.log(total, min, max);

//   const setColor = new Array(pixelIters.length).fill(0);
//   for (let i = 0; i < setColor.length; i++) {
//     // if(i === 1000 || i === 20000) {
//     //   console.log(pixelIters[i], total, pixelIters[i] / 1000);
//     // }
//     setColor[i] = (10 * pixelIters[i]) / 1000;
//     if (pixelIters[i] >= iterationCount - 10) {
//       setColor[i] = 0;
//     }
//   }

//   return setColor;
// }

// function calculateHistogram(pixelIters) {
//   const histogram = Array(pixelIters.length).fill(0);
//   for (let i = 0; i < histogram.length; i++) {
//     let index = Math.floor(pixelIters[i]);
//     if (index < iterationCount) {
//       histogram[index] += 1;
//     }
//   }
//   let total = 0;
//   for (let i = 0; i < histogram.length; i++) {
//     total += histogram[i];
//   }
//   const divdHist = new Array(histogram.length).fill(0);
//   divdHist[0] = histogram[0] / total;
//   let max = -100;
//   for (let i = 1; i < divdHist.length; i++) {
//     divdHist[i] = divdHist[i - 1] + histogram[i] / total;
//   }

//   const setColor = new Array(pixelIters.length).fill(0);
//   for (let i = 0; i < pixelIters.length; i++) {
//     const iteration = pixelIters[i];
//     setColor[i] = 1000 * divdHist[iteration];
//     if (iteration >= iterationCount - 10) {
//       setColor[i] = 0;
//     }
//   }

//   return setColor;
// }

//runRenderer();
