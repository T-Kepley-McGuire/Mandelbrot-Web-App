import { resetZoom, zoom } from "./zoomer.js"
import { crosshairCoordinates, resetLocator } from "./locator.js"
import { run } from "./rendererParent.js"

window.addEventListener("load", (event) => {
    const goButton = document.querySelector("#go");

    goButton.addEventListener("click", (event) => {
        // THIS FUNCTION SHOULD RESET THE LOCATOR,
        // RESET THE ZOOM, AND RELOAD THE SET
        console.log(crosshairCoordinates, zoom);
        run(crosshairCoordinates, zoom);
        resetZoom();
        resetLocator();
        //reloadSet();
    })
});