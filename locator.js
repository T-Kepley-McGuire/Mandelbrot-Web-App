export let crosshairCoordinates = { x: 0.5, y: 0.5 };

window.addEventListener("load", () => {
  const canvas = document.querySelector("#locator");
  const context = canvas.getContext("2d");

  const rect = canvas.getBoundingClientRect(); // abs. size of element
  canvas.width = rect.width;
  canvas.height = rect.height;

  drawCrosshair(canvas, context);

  canvas.addEventListener("mousemove", (event) => {
    let { x, y } = getMousePosNormalized(canvas, event);
    const width = canvas.width;
    const height = canvas.height;
    x *= canvas.width;
    y *= canvas.height;
    context.strokeWidth = 1;
    context.strokeStyle = "rgba(255,255,255,0.5)";
    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
    context.closePath();

    drawCrosshair(canvas, context);
  });

  canvas.addEventListener("mouseout", (event) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCrosshair(canvas, context);
  });

  canvas.addEventListener("click", (event) => {
    crosshairCoordinates = getMousePosNormalized(canvas, event);
  });
});

function drawCrosshair(canvas, context) {
  const x = crosshairCoordinates.x * canvas.width;
  const y = crosshairCoordinates.y * canvas.height;
  draw(3, "black");
  draw(1, "white");

  function draw(strokeWidth, color) {
    context.strokeWidth = strokeWidth;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - 10, y);
    context.moveTo(x, y);
    context.lineTo(x, y - 10);
    context.moveTo(x, y);
    context.lineTo(x + 10, y);
    context.moveTo(x, y);
    context.lineTo(x, y + 10);
    context.stroke();
    context.closePath();
  }
}

function getMousePosNormalized(canvas, evt) {
  const rect = canvas.getBoundingClientRect(); // abs. size of element
  canvas.width = rect.width;
  canvas.height = rect.height;
  return {
    x: (evt.clientX - rect.left) / canvas.width, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) / canvas.height, // been adjusted to be relative to element
  };
}

export function resetLocator() {
  const canvas = document.querySelector("#locator");
  const context = canvas.getContext("2d");

  crosshairCoordinates.x = 0.5;
  crosshairCoordinates.y = 0.5;

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawCrosshair(canvas, context);
}
