export let zoom = 2;

window.addEventListener("load", () => { 
    let zoomslider = document.getElementById("zoomslider");
    let output = document.getElementById("zoomdisplay");
    const mid = zoomslider.value;
    output.innerHTML = zoom;
    
    zoomslider.addEventListener("input", (event) => {
        zoom = Number(zoomslider.value);

        output.innerHTML = Math.round(zoom);
    });
});

export function resetZoom() {
}