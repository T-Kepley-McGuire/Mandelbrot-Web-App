let readout;

window.addEventListener("load", (event) => {
  readout = document.querySelector("#displayreadout");
  readout.innerHTML = "yo mama";
});

export function printInformation(magnification, center, maxIterations) {
    const components = {
        x: (center.x.toExponential() + '').split("e"),
        y: (center.y.toExponential() + '').split("e")
    }
    
  readout.innerHTML = (
    `<div class="d-flex flex-row justify-content-around">
      <p>Magnification: ${magnification}</p>
      <p>
        Center: ${components.x[0].substring(0, 5) + "e" + components.x[1]}, ${components.y[0].substring(0, 5) + "e" + components.y[1]}
      </p>
      <p>Escape Iterations: ${maxIterations}</p>
    </div>`
  );
}
