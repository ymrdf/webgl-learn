import WebGLDebugUtil from 'webgl-debug';
let gl;
let shaderProgram;
let triangleVertexBuffer;

let hexagonVertexBuffer;
let stripVertexBuffer;
let stripElementBuffer;



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
  console.log(gl.ARRAY_BUFFER, triangleVertexBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  const triangleVertices = [
    0.3, 0.4, 0.0, 255, 0, 0, 255,
    0.7, 0.4, 0.0, 0, 250, 6, 255,
    0.5, 0.8, 0.0, 0, 0, 255, 255
  ];
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

  setupHexagonBuffer();
  setupStripBuffer();
}

function setupHexagonBuffer() {
  hexagonVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
  const hexagonVertices = [
    -0.3, 0.6, 0.0,
    -0.4, 0.8, 0.0,
    -0.6, 0.8, 0.0,
    -0.7, 0.6, 0.0,
    -0.6, 0.4, 0.0,
    -0.4, 0.4, 0.0,
    -0.3, 0.6, 0.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagonVertices), gl.STATIC_DRAW);
  hexagonVertexBuffer.itemSize = 3;
  hexagonVertexBuffer.numberOfItems = 7;
}

function setupStripBuffer() {
  stripVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, stripVertexBuffer);
  const stripVertices = [
    -0.5, 0.2, 0.0,
    -0.4, 0.0, 0.0,
    -0.3, 0.2, 0.0,
    -0.2, 0.0, 0.0,
    -0.1, 0.2, 0.0,
    0.0, 0.0, 0.0,
    0.1, 0.2, 0.0,
    0.2, 0.0, 0.0,
    0.3, 0.2, 0.0,
    0.4, 0.0, 0.0,
    0.5, 0.2, 0.0,

    -0.5, -0.3, 0.0,
    -0.4, -0.5, 0.0,
    -0.3, -0.3, 0.0,
    -0.2, -0.5, 0.0,
    -0.1, -0.3, 0.0,
    0.0, -0.5, 0.0,
    0.1, -0.3, 0.0,
    0.2, -0.5, 0.0,
    0.3, -0.3, 0.0,
    0.4, -0.5, 0.0,
    0.5, -0.3, 0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stripVertices), gl.STATIC_DRAW);
  stripVertexBuffer.itemSize = 3;
  stripVertexBuffer.numberOfItems = 11;

  stripElementBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripElementBuffer);
  const indices = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 11, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  stripElementBuffer.numberOfItems = 25;

}

function draw(gl) {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexBuffer.itemSize, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexBuffer.colorSize, gl.UNSIGNED_BYTE, true, 16, 12);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexBuffer.numberOfItems);

  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 1.0, 1.0, 1.0);

  gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, hexagonVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.drawArrays(gl.LINE_STRIP, 0, hexagonVertexBuffer.numberOfItems);

  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 0.5, 0.5, 0.0, 1.0);
  gl.bindBuffer(gl.ARRAY_BUFFER, stripVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, stripVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripElementBuffer);
  gl.drawElements(gl.TRIANGLE_STRIP, stripElementBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);

  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 1.0, 1.0, 1.0);
  gl.drawArrays(gl.LINE_STRIP, 0, 11);
  gl.drawArrays(gl.LINE_STRIP, 11, 11);
}

function startDraw() {
  requestAnimationFrame(() => {
    draw(gl);
    startDraw();
  })
}

function startup() {
  const canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  startDraw()
}

window.onload = startup;