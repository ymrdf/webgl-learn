import WebGLDebugUtil from 'webgl-debug';
let gl;
let shaderProgram;
let vertexBuffer;



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
    void main() {
      gl_Position = vec4(aVertexPosition,1.0);
    }
  `;
  const fragementShaderSource = glsl`
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }
  `;
  console.log(vertexShaderSource, fragementShaderSource)

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

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
}

function setupBuffers() {
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const triangleVertices = [
    0.0, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexBuffer.itemSize = 3;
  vertexBuffer.numberOfItems = 3;
}

function draw(gl) {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}

function startup() {
  console.log();
  const canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  draw(gl);
  //console.log(gl.getError());
}

window.onload = startup;