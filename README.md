# Mandelbrot-Web-App
A rendering engine for the Mandelbrot Set built for the web.

*Built by T. Kepley McGuire*

Runs locally to calculate and render the Mandelbrot Set using the GPU

## About
The Mandelbrot Set is a set of complex numbers that all share an attribute:
The set is defined in the complex plane as the complex numbers c for which the function f<sub>c</sub>(z)=z<sup>2</sup>+c 
does not diverge to infinity when iterated starting at z=0

In other words, the complex number c can be iterated with the function z<sub>n+1</sub>=z<sub>n</sub><sup>2</sup>+c.
If the result of this number goes towards infinity (the absolute distance from the origin increases without end), the
number is considered to be ***not*** in the set. An accurate guess can be made if a number is within the set if after 
many iterations, the number has not significantly moved away from the origin. The number of iterations needed to accurately
determine this changes, but 100-1000 are needed initially to get a rough idea of the bounds of the set.

Why is this interesting?

The Mandelbrot Set is unique because it is what is known as a fractal--a mathematical object with infinite detail. Some 
other examples of fractals include the Koch curve, the Sierpinski triangle, and more. The Mandelbrot Set is unique however
because it is not self similar. As the level of detail incrases, new patterns that are not repeated in lower detailed 
views arise. This means that the set holds infinite detail. The simplicity yet enormity of the calculation makes the
Mandelbrot Set ideal for computers to calculate. By viewing the complex plane as an image, a rendering of the Mandelbrot
Set can be seen by calculating for each point or pixel how many iterations are needed to reach the escape boundary
(an inverse event horizon of sorts), then color coding each pixel based on that number. Finally stylings can be applied
to beautify the rendered set. 

Zoomming and exploring on the fractal is fascinating, as one quickly can become overwhelmed with the sheer enormity of
the detail. Nothing is ever the same, yet similar patters constantly arise and fade away. The fractal-naut can be sucked
into a never ending spiral always searching for the Misiurewicz point but never finding it or sent spiraling off into eddies
of eddies of eddies. The explorer may gradually explore more and more unfamiliar fractal terrain with alien sights only to
be greeted by the all-pervasive cardioid.

While it is easy to become enraptured with the fractal-scapes, the computer science behind the rendering of the set is no
less fascinating. The equation for rendering is deceptively simple. With up to millions of points in one image and each point
needing up to hundreds of thousands of iterations to conclusively calculate, the amount of computation ***quickly*** gets
out of hand. To mitigate this, there are many optimizations available. 

### Optimizations

The first and most essential optimization is modifying the original equation to be more computer friendly. By parsing the real and
imaginary components of the complex number iterator and further precalculating the squares of each component, the structure
of the equation is made possible for computers to handle and handle efficiently.

The second and nearly no less essential optimization is using the escape boundary. Any point that lies outside the circle
around the origin with radius 2 is mathematically guaranteed to increase towards infinity upon iteration. That means that
if the squares of the components of the point sum to be greater than 4, then the point is not within the set. Additionally
since points "jump" around the set during iteration, if a point that was within the radius falls outside of it after some
iterations, the original point too is guaranteed to expand towards infinity and not be in the set.

A more complex optimization is the use of multithreading. In this project, the author has massively parallelized the 
computations using the GPU. This is possible because each point can be calculated independently of any other point, and
so by using a compute shader, the GPU can do vastly more work than the CPU in a short amount of time.

The next optimization makes note of the fact that points tend to "orbit" around the set with particular periods before converging
into the set. A point may orbit eternally and so calculating the entire journey of the point is necessary unless one can
detect the orbit. This is done by comparing points with previous points to see if they are nearby each other (essentially, 
has the current point passed nearby in one of it's previous orbits). Orbital periods change throughout the set with some
points completing an orbit in 2, 3, 4, etc. iterations. To account for this, orbital periods of up to 20 are checked.

A higher level optimization that can be run is chunking. First separate the main image into regions. Then calculate the 
bounding box of the region. If the whole bounding box is within the set, the interior of the box is highly likely to also
be part of the set. This avoids calculating the vast amounts of points in the large continents of the set which can tend to
run up to the maximum number of iterations without going to infinity. As one can imagine, this would get computationally expensive
quickly and so by sidestepping the majority of those calculations, much work can be avoided. The author has not included
this optimization in this implimentaiton of the set because it would tend to break the massive parallellization of GPU 
programming.

Other optimization techniques include edge detection (similar idea to chunking), symmetry utilization (the set is horizontally
symmetrical, so one only has to calculate one half of the set if the other half is in view), and peturbation theory (the author
definitely doesn't know what the heck that is)

## Implimentation

This app is coded in HTML, JavaScript, and WebGPU Shading Language (WGSL)

Bootstrap is used for styling

WebGPU API is used for communicatin with the GPU

## Installation
Fork and clone repository

Open command prompt to folder and run ```npm install```

Run ```npm start``` to open live server in browser
