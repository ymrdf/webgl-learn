import WebGLDebugUtil from 'webgl-debug';
let gl;
let shaderProgram;
let triangleVertexBuffer;



const glsl = x => x;

const createGLContext = (canvas) => {
  const context = canvas.getContext('webgl');
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  }
  return WebGLDebugUtil.makeDebugContext(context, function (err, funcName, args) {
    throw WebGLDebugUtils.glEnumToString(err)
    + "was caused by call to "
    + funcName;
  });
}

const loadShader = (type, shaderSource) => {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Error compiling shader" + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const setupShaders = () => {
  const vertexShaderSource = glsl`
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;
    varying vec4 vColor;
    void main() {
      vColor = aVertexColor;
      gl_Position = vec4(aVertexPosition,1.0);
    }
  `;
  const fragementShaderSource = glsl`
    precision mediump float;
    varying vec4 vColor;
    void main() {
      gl_FragColor = vec4(vColor);
    }
  `;

  const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShaderSource = loadShader(gl.FRAGMENT_SHADER, fragementShaderSource);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShaderSource);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  console.log(0, shaderProgram.vertexPositionAttribute, shaderProgram.vertexColorAttribute);
}

function setupBuffers() {
  triangleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);


  const triangleVertices = [
    0.0, 0.5, 0.0, 255, 0, 0, 255,
    -0.5, -0.5, 0.0, 0, 250, 6, 255,
    0.5, -0.5, 0.0, 0, 0, 255, 255
  ];

  // const triangleVertices = [
  //   0.0, 0.0, 2.0, 0, 0, 0, 255,
  //   1.0, -1.0, 0.0, 0, 0, 0, 255,
  //   1.0, 1.0, 0.0, 0, 0, 0, 255
  // ];

  const nbrOfVertices = 3;

  const vertexSizeInBytes = 3 * Float32Array.BYTES_PER_ELEMENT + 4 * Uint8Array.BYTES_PER_ELEMENT;

  const vertexSizeInFloats = vertexSizeInBytes / Float32Array.BYTES_PER_ELEMENT;

  const buffer = new ArrayBuffer(nbrOfVertices * vertexSizeInBytes);

  const positionView = new Float32Array(buffer);

  const colorView = new Uint8Array(buffer);

  let positionOffsetInFloats = 0;
  let colorOffsetInBytes = 12;
  let k = 0;

  for (let i = 0; i < nbrOfVertices; i++) {
    positionView[positionOffsetInFloats] = triangleVertices[k];
    positionView[1 + positionOffsetInFloats] = triangleVertices[k + 1];
    positionView[2 + positionOffsetInFloats] = triangleVertices[k + 2];
    colorView[colorOffsetInBytes] = triangleVertices[k + 3];
    colorView[1 + colorOffsetInBytes] = triangleVertices[k + 4];
    colorView[2 + colorOffsetInBytes] = triangleVertices[k + 5];
    colorView[3 + colorOffsetInBytes] = triangleVertices[k + 6];

    positionOffsetInFloats += vertexSizeInFloats;
    colorOffsetInBytes += vertexSizeInBytes;
    k += 7;
  }
  gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
  triangleVertexBuffer.itemSize = 3;
  triangleVertexBuffer.numberOfItems = 3;
  triangleVertexBuffer.colorSize = 4;
}

function draw(gl) {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexBuffer.itemSize, gl.FLOAT, false, 16, 0);

  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexBuffer.colorSize, gl.UNSIGNED_BYTE, true, 16, 12);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexBuffer.numberOfItems);
}

function startup() {
  const canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  draw(gl);
}

window.onload = startup;