import { resetView } from "./rendererParent.js";
import { resetIterations } from "./slider.js";
import { resetZoom } from "./zoomer.js";

window.addEventListener("load", () => {
    const reset = document.getElementById("reset");
    reset.addEventListener("click", (event) => {
        resetView();
        resetZoom();
        resetIterations();
    })
})