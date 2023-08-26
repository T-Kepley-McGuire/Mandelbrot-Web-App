
let slider = document.getElementById("iterationslider");
let output = document.getElementById("iterationdisplay");
export let maxIterations = 1000;
const mid = slider.value;
output.innerHTML = maxIterations;

slider.onchange = function() {
    const delta = this.value - mid;
    if(delta < 0) {
        maxIterations = maxIterations / (1 + Math.abs(delta));
        
    } else if (delta > 0) {
        maxIterations = maxIterations * (1 + Math.abs(delta));
    }
    
    this.value = mid;
    output.innerHTML = Math.round(maxIterations);
}

slider.oninput = function() {
    const delta = this.value - mid;
    let temp = maxIterations;
    if(delta < 0) {
        temp = maxIterations / (1 + Math.abs(delta));
    } else if(delta > 0) {
        temp = maxIterations * (1 + Math.abs(delta));
    }

    output.innerHTML = Math.round(temp);
}