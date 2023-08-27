@group(0) @binding(0)
var<storage, read_write> output : array<f32>;

struct MyBuffer {
    data : array<vec2 < f32>>
};

@group(0) @binding(1) var<storage, read_write> myBuffer : MyBuffer;

@group(0) @binding(2) var<storage, read_write> iterationArray : array<i32>;


fn calc(x0 : f32, y0 : f32, approx : f32) -> f32
{
    var x : f32 = 0.0;
    var y : f32 = 0.0;
    var iteration : f32 = 0;
    var zx2 : f32 = 0.0;
    var zy2 : f32 = 0.0;
    var max_iteration : f32 = f32(iterationArray[0]);
    //var xold : f32 = 0.0;
    //var yold : f32 = 0.0;
    //var period : i32 = 0;

    loop {
        if !(zx2 + zy2 <= 4.0 && iteration < max_iteration)
        {
            break;
        }
        var xtemp : f32 = zx2 - zy2 + x0;
        y = 2 * x * y + y0;
        x = xtemp;
        //zy = (zx + zx) * zy + cX;
        //zx = zx2 - zy2 + cY;
        zx2 = x * x;
        zy2 = y * y;
        iteration = iteration + 1;
    }

    if (iteration < max_iteration) 
    {
        var log_zn : f32 = log(zx2 + zy2) / 2;
        var nu : f32 = log(log_zn / log(2)) / log(2);

        iteration = iteration + 1 - nu;
    }

    return iteration;
}


@compute @workgroup_size(64)
fn main(
@builtin(global_invocation_id)
global_id : vec3u,

@builtin(local_invocation_id)
local_id : vec3u,
)
{
    output[global_id.x] = f32(calc(myBuffer.data[global_id.x].x, myBuffer.data[global_id.x].y, 0.01));
    //var len : u32 = global_id.x;
    //for(var i : u32 = 0; i < len; i += 1)
    //{
    //output[global_id.x] += 1;
    //}
}
