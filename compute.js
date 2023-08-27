let device = null;
let shaderModule = null;

export async function initializeShader() {
  if (!navigator.gpu) {
    throw Error("WebGPU not supported.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw Error("Couldn't request WebGPU adapter.");
  }

  device = await adapter.requestDevice();

  const shaders = await fetch("computeShader.wgsl").then((response) =>
    response.text()
  );
  shaderModule = device.createShaderModule({
    code: shaders,
  });
}

export async function runShader(rawInputs, iterationCount) {
  if (!device || !shaderModule)
    throw Error("Initialize shader before executing");
  if (!rawInputs instanceof Float32Array)
    throw Error("Invalid inputs. Please supply a Float32Array");

  const inputSize = rawInputs.length * Float32Array.BYTES_PER_ELEMENT;
  if (inputSize % 2 !== 0)
    throw Error("Invalid inputs. Please supply an array of coordinates");
  const outputSize = inputSize / 2;
  const input = device.createBuffer({
    size: inputSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(input, 0, rawInputs);

  const output = device.createBuffer({
    size: outputSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const stagingBuffer = device.createBuffer({
    size: outputSize,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const iterationBuffer = device.createBuffer({
    size: Int32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(iterationBuffer, 0, new Int32Array([iterationCount]));

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
    ],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: output,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: input,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: iterationBuffer
        }
      }
    ],
  });

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
  });

  const commandEncoder = device.createCommandEncoder();

  // Initiate render pass
  const passEncoder = commandEncoder.beginComputePass();

  // Issue commands
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);

  const workGroupPartition =
    outputSize / 64 <= 65535
      ? outputSize / 64
      : outputSize / 128 <= 65535
      ? outputSize / 128
      : outputSize / 256 <= 65535
      ? outputSize / 256
      : outputSize / 512;

  passEncoder.dispatchWorkgroups(Math.ceil(workGroupPartition));

  // End the render pass
  passEncoder.end();

  commandEncoder.copyBufferToBuffer(
    output,
    0, // Source offset
    stagingBuffer,
    0, // Destination offset
    outputSize
  );

  // End frame by passing array of command buffers to command queue for execution
  device.queue.submit([commandEncoder.finish()]);

  await stagingBuffer.mapAsync(
    GPUMapMode.READ,
    0, // Offset
    outputSize // Length
  );

  const copyArrayBuffer = stagingBuffer.getMappedRange(0, outputSize);
  const data = copyArrayBuffer.slice();
  stagingBuffer.unmap();
  return new Float32Array(data);
}
