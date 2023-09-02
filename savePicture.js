import { imageBitmap as bmp } from "./renderer.js";

window.addEventListener("load", () => {
  const download = document.getElementById("download");
  download.addEventListener("click", async (event) => {
    const canvas = document.createElement("canvas");
    // resize it to the size of our ImageBitmap
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    // get a bitmaprenderer context
    const ctx = canvas.getContext("bitmaprenderer");
    ctx.transferFromImageBitmap(bmp);
    // get it back as a Blob
    const blob2 = await new Promise((res) => canvas.toBlob(res));

    const href = URL.createObjectURL(blob2);
    const anchorElement = document.createElement("a");
    anchorElement.href = href;
    anchorElement.download = "mandelbrot-render.png";

    document.body.appendChild(anchorElement);
    anchorElement.click();

    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(href);
  });
});
