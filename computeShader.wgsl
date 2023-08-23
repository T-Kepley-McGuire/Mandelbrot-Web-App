@group(0) @binding(0)
var<storage, read_write> output : array<f32>;

struct MyBuffer {
    data : array<vec2 < f32>>
};

@group(0) @binding(1) var<storage, read_write> myBuffer : MyBuffer;


fn calc(cX : f32, cY : f32, approx : f32) -> i32
{
    var zx : f32 = 0.0;
    var zy : f32 = 0.0;
    var iteration : i32 = 0;
    var zx2 : f32 = 0.0;
    var zy2 : f32 = 0.0;
    var max_iteration : i32 = 1000;
    var xold : f32 = 0.0;
    var yold : f32 = 0.0;
    var period : i32 = 0;

    loop {
        if !(zx2 + zy2 <= 4.0 && iteration < max_iteration)
        {
            break;
        }
        zy = (zx + zx) * zy + cX;
        zx = zx2 - zy2 + cY;
        zx2 = zx * zx;
        zy2 = zy * zy;
        iteration++;
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
