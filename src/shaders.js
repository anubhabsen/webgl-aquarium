var shaders = {}

function compileShader(gl, shaderSource, shaderType) {
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

  return shader;
}

function createProgram(gl, name, vertexShader, fragmentShader) {
  // create a program.
  var progra = gl.createProgram();

  // attach the shaders.
  gl.attachShader(progra, vertexShader);
  gl.attachShader(progra, fragmentShader);

  // link the program.
  gl.linkProgram(progra);

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  // Check if it linked.
  var success = gl.getProgramParameter(progra, gl.LINK_STATUS);
  if (!success) {
    // something went wrong with the link
    throw ("program filed to link:" + gl.getProgramInfoLog (progra));
  }

  window.program = progra;
  program.positionAttribute = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(program.vertexAttribute);

  program.normalAttribute = gl.getAttribLocation(program, "a_normal");
  gl.enableVertexAttribArray(program.normalAttribute);

  program.textureAttribute = gl.getAttribLocation(program, "a_texture");
  gl.enableVertexAttribArray(program.textureAttribute);

  shaders[name] = progra;
}

function openFile(name, filename){
  $.get(filename + '.vs', function (vxShaderData) {
    var vxShader = compileShader(gl, vxShaderData, gl.VERTEX_SHADER)
    $.get(filename + '.frag', function (fragShaderData) {
      console.log(vxShaderData, fragShaderData)
      var fragShader = compileShader(gl, fragShaderData, gl.FRAGMENT_SHADER)
      createProgram(gl, name, vxShader, fragShader)
    }, 'text');
  }, 'text');
}

function createShader(shadername) {
  openFile(shadername, 'shaders/' + shadername)
}

function useShader(shadername) {
  window.program = shaders[shadername]
  gl.useProgram(window.program);
}

module.exports = {
  compileShader,
  createShader,
  useShader,
}
